import { Resend } from 'resend';
import EmailTemplateRenderer from '../email/templateRenderer';

const resend = new Resend(process.env.RESEND_API_KEY!);
const templateRenderer = new EmailTemplateRenderer();

export const FROM_EMAIL_MASTERLIST = {
  WELCOME: 'welcome@abdulamite.me',
  SUPPORT: 'support@abdulamite.me',
  NOREPLY: 'noreply@abdulamite.me',
} as const;

interface EmailParams {
  to: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  from?: keyof typeof FROM_EMAIL_MASTERLIST;
}

interface TemplatedEmailParams {
  to: string | string[];
  templateName: string;
  subject: string;
  templateData: any;
  from?: keyof typeof FROM_EMAIL_MASTERLIST;
  layout?: string | false;
}

export class ResendService {
  constructor() {
    // Initialize template renderer
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    try {
      await templateRenderer.initialize();
    } catch (error) {
      console.error('Failed to initialize email templates:', error);
    }
  }

  async sendEmail(params: EmailParams): Promise<string | undefined> {
    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL_MASTERLIST[params.from || 'NOREPLY'],
        to: params.to,
        subject: params.subject,
        html: params.htmlBody,
        text: params.textBody ?? '',
      });
      return response.data?.id;
    } catch (error) {
      console.error('Error sending email:', error);
      return undefined;
    }
  }

  async sendTemplatedEmail(
    params: TemplatedEmailParams
  ): Promise<string | undefined> {
    try {
      // Check if template exists
      if (!templateRenderer.templateExists(params.templateName)) {
        throw new Error(`Template "${params.templateName}" not found`);
      }

      // Render the template
      const htmlContent = await templateRenderer.renderTemplate({
        templateName: params.templateName,
        subject: params.subject,
        data: params.templateData,
        layout: params.layout,
      });

      const response = await resend.emails.send({
        from: FROM_EMAIL_MASTERLIST[params.from || 'NOREPLY'],
        to: params.to,
        subject: params.subject,
        html: htmlContent,
      });

      return response.data?.id;
    } catch (error) {
      console.error('Error sending templated email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email using template
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    options?: {
      actionUrl?: string;
      companyName?: string;
      supportEmail?: string;
    }
  ): Promise<string | undefined> {
    return this.sendTemplatedEmail({
      to,
      templateName: 'welcome',
      subject: `Welcome to ${options?.companyName || 'Our Platform'}!`,
      templateData: {
        userName,
        actionUrl: options?.actionUrl,
        companyName: options?.companyName,
        supportEmail: options?.supportEmail,
      },
      from: 'WELCOME',
    });
  }

  /**
   * Send school welcome email using template
   */
  async sendSchoolWelcomeEmail(
    to: string,
    schoolName: string,
    ownerName: string,
    options?: {
      schoolPhone?: string;
      schoolWebsite?: string;
      dashboardUrl?: string;
      companyName?: string;
      supportEmail?: string;
    }
  ): Promise<string | undefined> {
    return this.sendTemplatedEmail({
      to,
      templateName: 'school-welcome',
      subject: `Welcome to Our School Management Platform - ${schoolName}!`,
      templateData: {
        schoolName,
        ownerName,
        schoolPhone: options?.schoolPhone,
        schoolWebsite: options?.schoolWebsite,
        dashboardUrl: options?.dashboardUrl,
        companyName: options?.companyName,
        supportEmail: options?.supportEmail,
      },
      from: 'WELCOME',
    });
  }

  /**
   * Send password reset email using template
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string,
    options?: {
      expirationTime?: string;
      companyName?: string;
      supportEmail?: string;
    }
  ): Promise<string | undefined> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return this.sendTemplatedEmail({
      to,
      templateName: 'password-reset',
      subject: 'Password Reset Request',
      templateData: {
        userName,
        resetUrl,
        resetToken,
        expirationTime: options?.expirationTime || '1 hour',
        companyName: options?.companyName,
        supportEmail: options?.supportEmail,
      },
      from: 'SUPPORT',
    });
  }

  /**
   * Send notification email using template
   */
  async sendNotificationEmail(
    to: string,
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
    }
  ): Promise<string | undefined> {
    return this.sendTemplatedEmail({
      to,
      templateName: 'notification',
      subject: notificationTitle,
      templateData: {
        notificationTitle,
        message,
        userName,
        isUrgent: options?.isUrgent || false,
        actionRequired: options?.actionRequired || false,
        actionDescription: options?.actionDescription,
        actionUrl: options?.actionUrl,
        actionButtonText: options?.actionButtonText || 'Take Action',
        additionalInfo: options?.additionalInfo,
        companyName: options?.companyName,
        supportEmail: options?.supportEmail,
      },
      from: 'NOREPLY',
    });
  }

  /**
   * Get list of available templates
   */
  getAvailableTemplates(): string[] {
    return templateRenderer.getAvailableTemplates();
  }

  /**
   * Check if a template exists
   */
  templateExists(templateName: string): boolean {
    return templateRenderer.templateExists(templateName);
  }

  private renderTemplate(templateName: string, templateData: any): string {
    // This method is deprecated - use sendTemplatedEmail instead
    return `<div><h1>${templateName}</h1><pre>${JSON.stringify(templateData, null, 2)}</pre></div>`;
  }
}
