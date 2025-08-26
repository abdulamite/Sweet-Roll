import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getUserById,
  getAllUsers,
  deleteUserById,
  createNewUser,
} from '../repo/user';
import { User } from '../models/user';

export class UserHandler {
  /**
   * Create new user - public route
   */
  static async createUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = request.body as Omit<User, 'id'>;

      // Validate input
      if (!userData.email || !userData.name) {
        return reply.code(400).send({ error: 'Name and email are required' });
      }

      const newUser = await createNewUser(userData);
      reply.code(201).send(newUser);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to create user' });
    }
  }

  /**
   * Get user by ID - business logic for user retrieval
   */
  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      // Validate input
      if (!id || isNaN(Number(id))) {
        return reply.code(400).send({ error: 'Valid user ID is required' });
      }

      const user = await getUserById(Number(id));

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      reply.send(user);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to retrieve user' });
    }
  }

  /**
   * Get all users - business logic for user listing
   */
  static async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await getAllUsers();
      reply.send(users);
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to retrieve users' });
    }
  }

  /**
   * Delete user - business logic for user deletion
   */
  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      // Validate input
      if (!id || isNaN(Number(id))) {
        return reply.code(400).send({ error: 'Valid user ID is required' });
      }

      const deleted = await deleteUserById(Number(id));

      if (!deleted) {
        return reply.code(404).send({ error: 'User not found' });
      }

      reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to delete user' });
    }
  }
}
