import { FastifyInstance } from 'fastify';

// Import public route modules
import authPublicRoutes from '../auth/public';
import onboardingRoutesPublic from '../onboarding/public';
import emailTestRoutes from '../emailTest';
import queueTestRoutes from '../queueTest';
import userRoutesPublic from '../user/public';

export default async function publicRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register public route modules
  fastify.register(authPublicRoutes); // Login, register, etc.
  fastify.register(onboardingRoutesPublic); // School registration/onboarding
  fastify.register(emailTestRoutes); // Email testing (probably should be authenticated in production)
  fastify.register(queueTestRoutes); // Queue testing (probably should be authenticated in production)
  fastify.register(userRoutesPublic); // User profile, settings, etc.
}
