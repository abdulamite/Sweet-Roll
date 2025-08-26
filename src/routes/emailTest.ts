import { FastifyInstance } from 'fastify';
import EmailTestHandler from '../handlers/emailTestHandler';

async function emailTestRoutes(fastify: FastifyInstance) {
  // Get available templates
  fastify.get('/email/templates', EmailTestHandler.getAvailableTemplates);

  // Test welcome email
  fastify.post(
    '/email/test/welcome',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            userName: { type: 'string' },
            actionUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    EmailTestHandler.testWelcomeEmail
  );

  // Test school welcome email
  fastify.post(
    '/email/test/school-welcome',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            schoolName: { type: 'string' },
            ownerName: { type: 'string' },
            schoolPhone: { type: 'string' },
            schoolWebsite: { type: 'string', format: 'uri' },
            dashboardUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    EmailTestHandler.testSchoolWelcomeEmail
  );

  // Test password reset email
  fastify.post(
    '/email/test/password-reset',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            userName: { type: 'string' },
          },
        },
      },
    },
    EmailTestHandler.testPasswordResetEmail
  );

  // Test notification email
  fastify.post(
    '/email/test/notification',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            userName: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            isUrgent: { type: 'boolean' },
            actionRequired: { type: 'boolean' },
            actionUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    EmailTestHandler.testNotificationEmail
  );

  // Test custom template
  fastify.post(
    '/email/test/custom',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'templateName', 'subject'],
          properties: {
            email: { type: 'string', format: 'email' },
            templateName: { type: 'string' },
            subject: { type: 'string' },
            templateData: { type: 'object' },
          },
        },
      },
    },
    EmailTestHandler.testCustomTemplate
  );
}

export default emailTestRoutes;
