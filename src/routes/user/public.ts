import { FastifyInstance } from 'fastify';
import { UserHandler } from '../../handlers/userHandler';

export default async function userRoutesPublic(fastify: FastifyInstance) {
  fastify.post('/users', UserHandler.createUser);
  fastify.post('/users/:userId/activate', UserHandler.activateUser);
  fastify.post('/users/:userId/password', UserHandler.createUserPassword);
}
