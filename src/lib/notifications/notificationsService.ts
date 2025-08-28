import QueueService from '../queue/queueService';

/**
 * NotificationService - Handles all notification types by queuing jobs
 * This service abstracts email sending by adding jobs to SQS instead of sending directly
 */
export class NotificationService {
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
  }

  /**
   * Queue a welcome email job
   * @param email - Recipient email address
   * @param userName - User's name
   * @param options - Additional options for the welcome email
   * @param delay - Optional delay in seconds before processing
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    options?: {
      actionUrl?: string;
      companyName?: string;
      supportEmail?: string;
    },
    delay: number = 0
  ): Promise<string | undefined> {
    console.log(`Queuing welcome email for: ${email}`);

    try {
      const messageId = await this.queueService.enqueueJob(
        'welcome-email',
        {
          email,
          userName,
          options,
        },
        delay
      );

      console.log(
        `Welcome email job queued successfully for ${email}, messageId: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(`Failed to queue welcome email for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Queue a school welcome email job
   * @param email - Recipient email address
   * @param schoolName - Name of the school
   * @param ownerName - Name of the school owner
   * @param adminUserAccountActivationToken - Account activation token for the admin user
   * @param options - Additional options for the school welcome email
   * @param delay - Optional delay in seconds before processing
   */
  async sendSchoolWelcomeEmail(
    email: string,
    schoolName: string,
    ownerName: string,
    adminUserAccountActivationToken: string,
    options?: {
      schoolPhone?: string;
      schoolWebsite?: string;
      dashboardUrl?: string;
      companyName?: string;
      supportEmail?: string;
    },
    delay: number = 0
  ): Promise<string | undefined> {
    console.log(
      `Queuing school welcome email for: ${email}, school: ${schoolName}`
    );

    // Debug logging
    console.log('DEBUG - NotificationService.sendSchoolWelcomeEmail received:');
    console.log('1. email:', email);
    console.log('2. schoolName:', schoolName);
    console.log('3. ownerName:', ownerName);
    console.log(
      '4. adminUserAccountActivationToken:',
      adminUserAccountActivationToken
    );
    console.log('5. options:', options);
    console.log('6. delay:', delay);

    try {
      const messageId = await this.queueService.enqueueJob(
        'school-welcome-email',
        {
          email,
          schoolName,
          ownerName,
          adminUserAccountActivationToken,
          options,
        },
        delay
      );

      console.log(
        `School welcome email job queued successfully for ${email}, messageId: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(
        `Failed to queue school welcome email for ${email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Queue a password reset email job
   * @param email - Recipient email address
   * @param resetToken - Password reset token
   * @param userName - User's name
   * @param options - Additional options for the password reset email
   * @param delay - Optional delay in seconds before processing
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
    options?: {
      expirationTime?: string;
      companyName?: string;
      supportEmail?: string;
    },
    delay: number = 0
  ): Promise<string | undefined> {
    console.log(`Queuing password reset email for: ${email}`);

    try {
      const messageId = await this.queueService.enqueueJob(
        'password-reset-email',
        {
          email,
          resetToken,
          userName,
          options,
        },
        delay
      );

      console.log(
        `Password reset email job queued successfully for ${email}, messageId: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(
        `Failed to queue password reset email for ${email}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Queue a notification email job
   * @param email - Recipient email address
   * @param notificationTitle - Title of the notification
   * @param message - Notification message content
   * @param userName - User's name
   * @param options - Additional options for the notification
   * @param delay - Optional delay in seconds before processing
   */
  async sendNotificationEmail(
    email: string,
    notificationTitle: string,
    message: string,
    userName: string,
    options?: {
      isUrgent?: boolean;
      actionRequired?: boolean;
      actionDescription?: string;
      actionUrl?: string;
      actionButtonText?: string;
      additionalInfo?: string;
      companyName?: string;
      supportEmail?: string;
    },
    delay: number = 0
  ): Promise<string | undefined> {
    console.log(
      `Queuing notification email for: ${email}, title: ${notificationTitle}`
    );

    try {
      const messageId = await this.queueService.enqueueJob(
        'notification-email',
        {
          email,
          notificationTitle,
          message,
          userName,
          options,
        },
        delay
      );

      console.log(
        `Notification email job queued successfully for ${email}, messageId: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(`Failed to queue notification email for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Queue a custom templated email job
   * @param email - Recipient email address
   * @param templateName - Name of the template to use
   * @param subject - Email subject
   * @param templateData - Data to pass to the template
   * @param from - From address key
   * @param layout - Layout to use (optional)
   * @param delay - Optional delay in seconds before processing
   */
  async sendTemplatedEmail(
    email: string,
    templateName: string,
    subject: string,
    templateData: any,
    from?: string,
    layout?: string | false,
    delay: number = 0
  ): Promise<string | undefined> {
    console.log(
      `Queuing templated email for: ${email}, template: ${templateName}`
    );

    try {
      const messageId = await this.queueService.enqueueJob(
        'templated-email',
        {
          email,
          templateName,
          subject,
          templateData,
          from,
          layout,
        },
        delay
      );

      console.log(
        `Templated email job queued successfully for ${email}, messageId: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(`Failed to queue templated email for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Queue multiple email jobs at once
   * @param emailJobs - Array of email job configurations
   */
  async sendBulkEmails(
    emailJobs: Array<{
      type:
        | 'welcome'
        | 'school-welcome'
        | 'password-reset'
        | 'notification'
        | 'templated';
      email: string;
      data: any;
      delay?: number;
    }>
  ): Promise<string[]> {
    console.log(`Queuing ${emailJobs.length} bulk email jobs`);

    const messageIds: string[] = [];

    for (const job of emailJobs) {
      try {
        let messageId: string | undefined;

        switch (job.type) {
          case 'welcome':
            messageId = await this.sendWelcomeEmail(
              job.email,
              job.data.userName,
              job.data.options,
              job.delay
            );
            break;
          case 'school-welcome':
            messageId = await this.sendSchoolWelcomeEmail(
              job.email,
              job.data.schoolName,
              job.data.ownerName,
              job.data.adminUserAccountActivationToken,
              job.data.options,
              job.delay
            );
            break;
          case 'password-reset':
            messageId = await this.sendPasswordResetEmail(
              job.email,
              job.data.resetToken,
              job.data.userName,
              job.data.options,
              job.delay
            );
            break;
          case 'notification':
            messageId = await this.sendNotificationEmail(
              job.email,
              job.data.notificationTitle,
              job.data.message,
              job.data.userName,
              job.data.options,
              job.delay
            );
            break;
          case 'templated':
            messageId = await this.sendTemplatedEmail(
              job.email,
              job.data.templateName,
              job.data.subject,
              job.data.templateData,
              job.data.from,
              job.data.layout,
              job.delay
            );
            break;
        }

        if (messageId) {
          messageIds.push(messageId);
        }
      } catch (error) {
        console.error(`Failed to queue email job for ${job.email}:`, error);
        // Continue with other jobs even if one fails
      }
    }

    console.log(
      `Successfully queued ${messageIds.length} out of ${emailJobs.length} email jobs`
    );
    return messageIds;
  }

  /**
   * Schedule an email to be sent at a specific time
   * @param scheduleTime - When to send the email (Date object)
   * @param emailType - Type of email to send
   * @param emailData - Email data
   */
  async scheduleEmail(
    scheduleTime: Date,
    emailType: string,
    emailData: any
  ): Promise<string | undefined> {
    const now = new Date();
    const delay = Math.max(
      0,
      Math.floor((scheduleTime.getTime() - now.getTime()) / 1000)
    );

    console.log(
      `Scheduling email for ${scheduleTime.toISOString()}, delay: ${delay} seconds`
    );

    return this.queueService.enqueueJob(emailType, emailData, delay);
  }
}

export default NotificationService;
