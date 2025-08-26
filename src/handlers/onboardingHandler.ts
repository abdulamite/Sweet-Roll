import { FastifyRequest, FastifyReply } from 'fastify';
import { OnboardingFormDataSchool } from '../models/school';
import { createNewSchool } from '../repo/school';
import { FROM_EMAIL_MASTERLIST, ResendService } from '../lib/resend/client';

export class OnboardingHandler {
  static async processOnboardingForm(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const formData = request.body as Omit<OnboardingFormDataSchool, 'id'>;

      // Validate form data
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Invalid onboarding form data',
          details: validationErrors,
        });
      }

      // Create the school
      const newSchool = await createNewSchool(formData);

      try {
        const resendService = new ResendService();
        await resendService.sendWelcomeEmail(
          formData.businessOwnerInformation.email,
          formData.businessOwnerInformation.name
        );
        request.log.info(
          `School welcome email sent to ${formData.businessOwnerInformation.email}`
        );
      } catch (emailError) {
        // Log email error but don't fail the onboarding process
        request.log.error(
          `Failed to send welcome email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
        );
      }

      reply.code(201).send({
        message: 'School onboarding completed successfully',
        school: newSchool,
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

      // Business logic to check onboarding completion
      // This could check various flags in the database

      reply.send({
        userId: parseInt(userId),
        isComplete: false, // Replace with actual logic
        steps: {
          profileSetup: true,
          emailVerification: false,
          preferences: false,
        },
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        error: 'Failed to get onboarding status',
      });
    }
  }
}

const validateFormData = (
  data: Omit<OnboardingFormDataSchool, 'id'>
): string[] => {
  const errors: string[] = [];

  // Validate school basic info
  if (!data.name) {
    errors.push('School name is required');
  }
  if (!data.phone) {
    errors.push('School phone is required');
  }
  if (!data.website) {
    errors.push('School website is required');
  }
  if (!data.logo) {
    errors.push('School logo is required');
  }
  if (!data.supportEmail) {
    errors.push('School support email is required');
  }

  // Validate address
  if (!data.address) {
    errors.push('School address is required');
  } else {
    if (!data.address.street) {
      errors.push('Address street is required');
    }
    if (!data.address.city) {
      errors.push('Address city is required');
    }
    if (!data.address.state) {
      errors.push('Address state is required');
    }
    if (!data.address.zipCode) {
      errors.push('Address zip code is required');
    }
  }

  // Validate business owner information
  if (!data.businessOwnerInformation) {
    errors.push('Business owner information is required');
  } else {
    if (!data.businessOwnerInformation.name) {
      errors.push('Business owner name is required');
    }
    if (!data.businessOwnerInformation.email) {
      errors.push('Business owner email is required');
    }
    if (!data.businessOwnerInformation.phone) {
      errors.push('Business owner phone is required');
    }
  }

  return errors;
};
