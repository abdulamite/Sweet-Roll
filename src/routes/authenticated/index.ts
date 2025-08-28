import { FastifyInstance } from 'fastify';
import userRoutesProtected from '../user/authenticated';
import authProtectedRoutes from '../auth/authenticated';
import schoolProtectedRoutes from '../schools/authenticated';

export default async function authenticatedRoutes(fastify: FastifyInstance) {
  // Register authenticated route modules
  fastify.register(userRoutesProtected); // User profile, settings, etc.
  fastify.register(schoolProtectedRoutes); // School management, students, etc.
  fastify.register(authProtectedRoutes); // Authentication-related routes
}
