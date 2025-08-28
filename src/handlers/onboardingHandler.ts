import { FastifyRequest, FastifyReply } from 'fastify';
import { OnboardingFormDataSchool } from '../models/school';
import { OnboardingService } from '../services/onboardingService';
import { AccountActivationTokensRepo } from '../repo/accountActivationTokens';

export class OnboardingHandler {
  static async processOnboardingForm(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const formData = request.body as Omit<OnboardingFormDataSchool, 'id'>;

      // Validate form data using the service
      const validationErrors =
        OnboardingService.validateOnboardingFormData(formData);
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Invalid onboarding form data',
          details: validationErrors,
        });
      }

      // Create the school with admin user using the service
      const { school: newSchool, adminUser } =
        await OnboardingService.createSchoolWithAdmin(formData);

      const adminUserAccountActivationToken =
        await AccountActivationTokensRepo.createToken(
          adminUser.id,
          newSchool.id
        );

      console.log(
        'DEBUG - adminUserAccountActivationToken value:',
        adminUserAccountActivationToken
      );
      console.log(
        'DEBUG - typeof adminUserAccountActivationToken:',
        typeof adminUserAccountActivationToken
      );

      if (!newSchool || !adminUser || !adminUserAccountActivationToken) {
        return reply.code(500).send({
          error: 'Failed to create school or admin user',
        });
      }

      // Queue welcome email for school owner (async processing)
      try {
        const notificationService = (request.server as any).notifications;

        // Debug logging
        console.log('DEBUG - About to call sendSchoolWelcomeEmail with:');
        console.log('1. email:', formData.businessOwnerInformation.email);
        console.log('2. schoolName:', formData.name);
        console.log('3. ownerName:', formData.businessOwnerInformation.name);
        console.log(
          '4. adminUserAccountActivationToken:',
          adminUserAccountActivationToken
        );
        console.log('5. options:', {
          schoolPhone: formData.phone,
          schoolWebsite: formData.website,
          dashboardUrl: `${process.env.FRONTEND_URL}/school/dashboard`,
          companyName: 'Your School Management Platform',
          supportEmail: formData.supportEmail,
        });
        console.log('6. delay:', 0);

        const messageId = await notificationService.sendSchoolWelcomeEmail(
          formData.businessOwnerInformation.email,
          formData.name,
          formData.businessOwnerInformation.name,
          (console.log(
            'INLINE DEBUG - token being passed:',
            adminUserAccountActivationToken
          ),
          adminUserAccountActivationToken),
          (console.log('INLINE DEBUG - options being passed:', {
            schoolPhone: formData.phone,
            schoolWebsite: formData.website,
            dashboardUrl: `${process.env.FRONTEND_URL}/school/dashboard`,
            companyName: 'Your School Management Platform',
            supportEmail: formData.supportEmail,
          }),
          {
            schoolPhone: formData.phone,
            schoolWebsite: formData.website,
            dashboardUrl: `${process.env.FRONTEND_URL}/school/dashboard`,
            companyName: 'Your School Management Platform',
            supportEmail: formData.supportEmail,
          }),
          0 // delay parameter
        );

        request.log.info(
          `School welcome email queued for ${formData.businessOwnerInformation.email}, messageId: ${messageId}`
        );
      } catch (emailError) {
        // Log email error but don't fail the onboarding process
        // The email will be retried by the queue system
        request.log.error(
          `Failed to queue welcome email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
        );
      }

      reply.code(201).send({
        message: 'School onboarding completed successfully',
        school: newSchool,
        adminUser: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
        },
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Failed to process onboarding form',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get onboarding status for a user
   */
  static async getOnboardingStatus(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params as { userId: string };

      // Validate input
      if (!userId || isNaN(Number(userId))) {
        return reply.code(400).send({ error: 'Valid user ID is required' });
      }

      // Use the service to get onboarding status
      const status = await OnboardingService.getOnboardingStatus(
        Number(userId)
      );
      reply.send(status);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Failed to get onboarding status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
