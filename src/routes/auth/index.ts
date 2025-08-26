// Auth routes index - combines public and protected auth routes
import { FastifyInstance } from 'fastify';
import authPublicRoutes from './public';
import authProtectedRoutes from './authenticated';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register public auth routes
  fastify.register(authPublicRoutes);

  // Register protected auth routes
  fastify.register(authProtectedRoutes);
}
