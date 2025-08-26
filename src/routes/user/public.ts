import { FastifyInstance } from 'fastify';
import { UserHandler } from '../../handlers/userHandler';

export default async function userRoutesPublic(fastify: FastifyInstance) {
  fastify.post('/users', UserHandler.createUser);
}
