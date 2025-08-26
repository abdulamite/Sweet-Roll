import { FastifyInstance } from 'fastify';
import { AuthHandler } from '../../handlers/authHandler';

export default async function authProtectedRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/logout', AuthHandler.logout);
}
