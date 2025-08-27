import { FastifyRequest, FastifyReply } from 'fastify';

export class EmailTestHandler {
  /**
   * Test welcome email template
   */
  static async testWelcomeEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, userName, actionUrl } = request.body as {
        email: string;
        userName?: string;
        actionUrl?: string;
      };

      if (!email) {
        return reply.code(400).send({
          success: false,
          error: 'Email address is required',
        });
      }

      const notificationService = (request.server as any).notifications;

      const messageId = await notificationService.sendWelcomeEmail(
        email,
        userName || 'Test User',
        {
          actionUrl,
          companyName: 'Your School Management Platform',
          supportEmail: 'support@abdulamite.me',
        }
      );

      reply.send({
        success: true,
        message:
          'Welcome email queued successfully (will be sent within 10 seconds)',
        messageId,
        template: 'welcome',
        note: 'This email is now processed asynchronously via SQS',
      });
    } catch (error) {
      request.log.error(
        `Failed to queue welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to queue welcome email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test school welcome email template
   */
  static async testSchoolWelcomeEmail(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const {
        email,
        schoolName,
        ownerName,
        schoolPhone,
        schoolWebsite,
        dashboardUrl,
      } = request.body as {
        email: string;
        schoolName?: string;
        ownerName?: string;
        schoolPhone?: string;
        schoolWebsite?: string;
        dashboardUrl?: string;
      };

      if (!email) {
        return reply.code(400).send({
          success: false,
          error: 'Email address is required',
        });
      }

      const notificationService = (request.server as any).notifications;

      // Debug: Check what we actually got
      console.log('notificationService:', notificationService);
      console.log('notificationService type:', typeof notificationService);
      if (notificationService) {
        console.log(
          'notificationService methods:',
          Object.getOwnPropertyNames(Object.getPrototypeOf(notificationService))
        );
      }

      const messageId = await notificationService.sendSchoolWelcomeEmail(
        email,
        schoolName || 'Test School',
        ownerName || 'School Administrator',
        {
          schoolPhone,
          schoolWebsite,
          dashboardUrl,
          companyName: 'Your School Management Platform',
          supportEmail: 'support@abdulamite.me',
        }
      );

      reply.send({
        success: true,
        message:
          'School welcome email queued successfully (will be sent within 10 seconds)',
        messageId,
        template: 'school-welcome',
        note: 'This email is now processed asynchronously via SQS',
      });
    } catch (error) {
      request.log.error(
        `Failed to send school welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to send school welcome email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test password reset email template
   */
  static async testPasswordResetEmail(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { email, userName } = request.body as {
        email: string;
        userName?: string;
      };

      if (!email) {
        return reply.code(400).send({
          success: false,
          error: 'Email address is required',
        });
      }

      const notificationService = (request.server as any).notifications;

      // Generate a fake reset token for testing
      const fakeResetToken = 'test-reset-token-' + Date.now();

      const messageId = await notificationService.sendPasswordResetEmail(
        email,
        fakeResetToken,
        userName || 'Test User',
        {
          expirationTime: '1 hour',
          companyName: 'Your School Management Platform',
          supportEmail: 'support@abdulamite.me',
        }
      );

      reply.send({
        success: true,
        message:
          'Password reset email queued successfully (will be sent within 10 seconds)',
        messageId,
        template: 'password-reset',
        note: 'This is a test email with a fake reset token, now processed asynchronously via SQS',
      });
    } catch (error) {
      request.log.error(
        `Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to send password reset email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test notification email template
   */
  static async testNotificationEmail(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const {
        email,
        userName,
        title,
        message,
        isUrgent,
        actionRequired,
        actionUrl,
      } = request.body as {
        email: string;
        userName?: string;
        title?: string;
        message?: string;
        isUrgent?: boolean;
        actionRequired?: boolean;
        actionUrl?: string;
      };

      if (!email) {
        return reply.code(400).send({
          success: false,
          error: 'Email address is required',
        });
      }

      const notificationService = (request.server as any).notifications;

      const messageId = await notificationService.sendNotificationEmail(
        email,
        title || 'Test Notification',
        message ||
          'This is a test notification message to demonstrate the email template system.',
        userName || 'Test User',
        {
          isUrgent,
          actionRequired,
          actionDescription: actionRequired
            ? 'Please review and take the necessary action.'
            : undefined,
          actionUrl,
          actionButtonText: 'View Details',
          companyName: 'Your School Management Platform',
          supportEmail: 'support@abdulamite.me',
        }
      );

      reply.send({
        success: true,
        message:
          'Notification email queued successfully (will be sent within 10 seconds)',
        messageId,
        template: 'notification',
        note: 'This email is now processed asynchronously via SQS',
      });
    } catch (error) {
      request.log.error(
        `Failed to send notification email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to send notification email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get list of available email templates
   */
  static async getAvailableTemplates(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // For template listing, we can use ResendService directly since it's not sending emails
      const { ResendService } = await import('../lib/resend/client');
      const resendService = new ResendService();
      const templates = resendService.getAvailableTemplates();

      reply.send({
        success: true,
        templates,
        count: templates.length,
        note: 'Template listing is synchronous - only actual email sending is async',
      });
    } catch (error) {
      request.log.error(
        `Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to get available templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test custom template with raw data
   */
  static async testCustomTemplate(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { email, templateName, subject, templateData } = request.body as {
        email: string;
        templateName: string;
        subject: string;
        templateData: any;
      };

      if (!email || !templateName || !subject) {
        return reply.code(400).send({
          success: false,
          error: 'Email, templateName, and subject are required',
        });
      }
      const notificationService = (request.server as any).notifications;

      // For template validation, we can use ResendService directly since it's not sending emails
      const { ResendService } = await import('../lib/resend/client');
      const resendService = new ResendService();

      if (!resendService.templateExists(templateName)) {
        return reply.code(404).send({
          success: false,
          error: `Template "${templateName}" not found`,
          availableTemplates: resendService.getAvailableTemplates(),
        });
      }

      const messageId = await notificationService.sendTemplatedEmail(
        email,
        templateName,
        subject,
        templateData || {},
        'NOREPLY'
      );

      reply.send({
        success: true,
        message:
          'Custom template email queued successfully (will be sent within 10 seconds)',
        messageId,
        template: templateName,
        note: 'This email is now processed asynchronously via SQS',
      });
    } catch (error) {
      request.log.error(
        `Failed to send custom template email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to send custom template email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default EmailTestHandler;
