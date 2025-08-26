import { FastifyInstance } from 'fastify';
import { AuthHandler } from '../../handlers/authHandler';

export default async function authPublicRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', AuthHandler.login);
}
