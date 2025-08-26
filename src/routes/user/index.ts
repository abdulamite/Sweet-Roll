// User routes index - combines public and protected user routes
import { FastifyInstance } from 'fastify';
import userPublicRoutes from './public';
import userProtectedRoutes from './authenticated';

export default async function userRoutes(fastify: FastifyInstance) {
  // Register public user routes
  fastify.register(userPublicRoutes);

  // Register protected user routes
  fastify.register(userProtectedRoutes);
}
