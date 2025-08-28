import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth';

// Import route groups
import publicRoutes from './public/index';
import authenticatedRoutes from './authenticated/index';

// Central route registration function
export default async function registerRoutes(fastify: FastifyInstance) {
  // Register public routes (no auth required)
  fastify.register(async function (fastify) {
    await fastify.register(publicRoutes);
  });

  // Register authenticated routes (auth middleware automatically applied)
  fastify.register(async function (fastify) {
    // Apply auth middleware to all routes in this context
    fastify.addHook('preHandler', authMiddleware);
    await fastify.register(authenticatedRoutes);
  });
}
