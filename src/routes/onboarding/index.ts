// Auth routes index - combines public and protected auth routes
import { FastifyInstance } from 'fastify';
import onboardingPublicRoutes from './public';

export default async function onboardingRoutes(fastify: FastifyInstance) {
  // Register public onboarding routes
  fastify.register(onboardingPublicRoutes);
}
