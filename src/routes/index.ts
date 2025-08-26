import { FastifyInstance } from 'fastify';
import authRoutes from './auth';
import userRoutes from './user';
import onboardingRoutes from './onboarding';
import queueTestRoutes from './queueTest';
import emailTestRoutes from './emailTest';

// Central route registration function
export default async function registerRoutes(fastify: FastifyInstance) {
  // Register all route modules
  fastify.register(authRoutes);
  fastify.register(userRoutes);
  fastify.register(onboardingRoutes);
  fastify.register(queueTestRoutes);
  fastify.register(emailTestRoutes);
}
