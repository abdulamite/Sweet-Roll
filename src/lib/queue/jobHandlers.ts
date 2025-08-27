import { ResendService } from '../resend/client';

/**
 * Email job handlers for processing different types of email jobs
 * These handlers will be called by the queue worker to actually send emails
 */
export class EmailJobHandlers {
  private resendService: ResendService;

  constructor() {
    this.resendService = new ResendService();
  }

  /**
   * Handle welcome email jobs
   */
  async handleWelcomeEmail(jobData: any) {
    const { email, userName, options } = jobData;

    console.log(`Processing welcome email job for: ${email}`);

    try {
      const messageId = await this.resendService.sendWelcomeEmail(
        email,
        userName,
        options
      );

      console.log(
        `Welcome email sent successfully to: ${email}, messageId: ${messageId}`
      );
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
      throw error; // Re-throw to let queue handle retry logic
    }
  }

  /**
   * Handle school welcome email jobs
   */
  async handleSchoolWelcomeEmail(jobData: any) {
    const { email, schoolName, ownerName, options } = jobData;

    console.log(`Processing school welcome email job for: ${email}`);

    try {
      const messageId = await this.resendService.sendSchoolWelcomeEmail(
        email,
        schoolName,
        ownerName,
        options
      );

      console.log(
        `School welcome email sent successfully to: ${email}, messageId: ${messageId}`
      );
    } catch (error) {
      console.error(`Failed to send school welcome email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Handle password reset email jobs
   */
  async handlePasswordResetEmail(jobData: any) {
    const { email, resetToken, userName, options } = jobData;

    console.log(`Processing password reset email job for: ${email}`);

    try {
      const messageId = await this.resendService.sendPasswordResetEmail(
        email,
        resetToken,
        userName,
        options
      );

      console.log(
        `Password reset email sent successfully to: ${email}, messageId: ${messageId}`
      );
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Handle notification email jobs
   */
  async handleNotificationEmail(jobData: any) {
    const { email, notificationTitle, message, userName, options } = jobData;

    console.log(`Processing notification email job for: ${email}`);

    try {
      const messageId = await this.resendService.sendNotificationEmail(
        email,
        notificationTitle,
        message,
        userName,
        options
      );

      console.log(
        `Notification email sent successfully to: ${email}, messageId: ${messageId}`
      );
    } catch (error) {
      console.error(`Failed to send notification email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Handle custom templated email jobs
   */
  async handleTemplatedEmail(jobData: any) {
    const { email, templateName, subject, templateData, from, layout } =
      jobData;

    console.log(
      `Processing templated email job for: ${email}, template: ${templateName}`
    );

    try {
      const messageId = await this.resendService.sendTemplatedEmail({
        to: email,
        templateName,
        subject,
        templateData,
        from,
        layout,
      });

      console.log(
        `Templated email sent successfully to: ${email}, messageId: ${messageId}`
      );
    } catch (error) {
      console.error(`Failed to send templated email to ${email}:`, error);
      throw error;
    }
  }
}

/**
 * General utility job handlers
 */
export class UtilityJobHandlers {
  /**
   * Handle file cleanup jobs
   */
  async handleFileCleanup(jobData: any) {
    const { filePaths, bucketName } = jobData;

    console.log(`Processing file cleanup job for ${filePaths.length} files`);

    // Implementation would depend on your storage service
    // For example, delete files from S3
    console.log(`Would clean up files: ${filePaths.join(', ')}`);

    // Simulate cleanup work
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`File cleanup completed`);
  }

  /**
   * Handle data export jobs
   */
  async handleDataExport(jobData: any) {
    const { userId, exportType, format } = jobData;

    console.log(
      `Processing data export job for user: ${userId}, type: ${exportType}`
    );

    // Simulate export work
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`Data export completed for user: ${userId}`);
  }

  /**
   * Handle backup jobs
   */
  async handleBackup(jobData: any) {
    const { backupType, timestamp } = jobData;

    console.log(`Processing backup job: ${backupType} at ${timestamp}`);

    // Simulate backup work
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`Backup completed: ${backupType}`);
  }
}

/**
 * Test job handlers for development and testing
 */
export class TestJobHandlers {
  /**
   * Handle test jobs
   */
  async handleTestJob(jobData: any) {
    console.log('Processing test job with data:', jobData);

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Test job completed successfully');
  }

  /**
   * Handle bulk test jobs
   */
  async handleBulkTestJob(jobData: any) {
    const { message, sequenceNumber } = jobData;

    console.log(`Processing bulk test job #${sequenceNumber}: ${message}`);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log(`Bulk test job #${sequenceNumber} completed`);
  }

  /**
   * Handle email processing jobs
   */
  async handleEmailProcessing(jobData: any) {
    console.log('Processing email-processing job:', jobData);

    // Simulate email processing work
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Email processing job completed');
  }
}
