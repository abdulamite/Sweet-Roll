// Email configuration and default values
export const EMAIL_CONFIG = {
  // Default company information
  COMPANY: {
    NAME: 'Your School Management Platform',
    SUPPORT_EMAIL: 'support@yourcompany.com',
    WEBSITE: 'https://yourcompany.com',
  },

  // Default email settings
  DEFAULTS: {
    SHOW_HEADER: true,
    LAYOUT: 'base',
  },

  // Template-specific configurations
  TEMPLATES: {
    WELCOME: {
      DEFAULT_ACTION_URL: `${process.env.FRONTEND_URL}/dashboard`,
      EXPIRATION_TIME: '24 hours',
    },

    SCHOOL_WELCOME: {
      DEFAULT_DASHBOARD_URL: `${process.env.FRONTEND_URL}/school/dashboard`,
    },

    PASSWORD_RESET: {
      EXPIRATION_TIME: '1 hour',
      DEFAULT_RESET_URL: `${process.env.FRONTEND_URL}/reset-password`,
    },

    NOTIFICATION: {
      DEFAULT_ACTION_BUTTON_TEXT: 'Take Action',
    },
  },

  // Email addresses for different types of emails
  FROM_ADDRESSES: {
    WELCOME: process.env.FROM_EMAIL_WELCOME || 'welcome@abdulamite.me',
    SUPPORT: process.env.FROM_EMAIL_SUPPORT || 'support@abdulamite.me',
    NOREPLY: process.env.FROM_EMAIL_NOREPLY || 'noreply@abdulamite.me',
    SECURITY: process.env.FROM_EMAIL_SECURITY || 'security@abdulamite.me',
  },
} as const;

// Helper to get template-specific defaults
export function getTemplateDefaults(templateName: string) {
  const templateKey = templateName
    .toUpperCase()
    .replace('-', '_') as keyof typeof EMAIL_CONFIG.TEMPLATES;
  return EMAIL_CONFIG.TEMPLATES[templateKey] || {};
}

// Helper to merge with default company data
export function mergeWithDefaults(data: any) {
  return {
    companyName: EMAIL_CONFIG.COMPANY.NAME,
    supportEmail: EMAIL_CONFIG.COMPANY.SUPPORT_EMAIL,
    showHeader: EMAIL_CONFIG.DEFAULTS.SHOW_HEADER,
    currentYear: new Date().getFullYear(),
    ...data,
  };
}
