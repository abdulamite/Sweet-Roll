import { FastifyInstance } from 'fastify';
import { UserHandler } from '../../handlers/userHandler';

export default async function userRoutesPublic(fastify: FastifyInstance) {
  fastify.post('/users', UserHandler.createUser);

  // Combined secure activation endpoint - requires token + password
  fastify.post(
    '/users/activate-account',
    UserHandler.activateAccountWithPassword
  );
}
