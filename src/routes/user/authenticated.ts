import { FastifyInstance } from 'fastify';
import { UserHandler } from '../../handlers/userHandler';

export default async function userRoutesProtected(fastify: FastifyInstance) {
  fastify.get('/users/:id', UserHandler.getUserById);
  fastify.get('/users', UserHandler.getAllUsers);
  fastify.delete('/users/:id', UserHandler.deleteUser);
  fastify.post('/users/:id/create-password', UserHandler.createUserPassword);
}
