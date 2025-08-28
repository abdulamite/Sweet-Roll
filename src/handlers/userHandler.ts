import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository, UserCreationData } from '../repo/user';
import { UserService } from '../services/userService';

export class UserHandler {
  /**
   * Create new user - public route
   */
  static async createUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = request.body as UserCreationData;

      // Validate input
      if (!userData.email || !userData.name) {
        return reply.code(400).send({ error: 'Name and email are required' });
      }

      const newUser = await UserRepository.create(userData);
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

      const user = await UserRepository.findById(Number(id));

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
      const users = await UserRepository.findAll();
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

      const deleted = await UserRepository.deleteById(Number(id));

      if (!deleted) {
        return reply.code(404).send({ error: 'User not found' });
      }

      reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to delete user' });
    }
  }

  static async activateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      const { token } = request.body as { token: string };

      console.log(request.params);

      // Validate input
      if (!userId || isNaN(Number(userId))) {
        return reply.code(400).send({ error: 'Valid user ID is required' });
      }

      if (!token) {
        return reply.code(400).send({ error: 'Activation token is required' });
      }

      // Activate user account
      const isActivated = await UserService.activateUserAccount(
        Number(userId),
        token
      );

      if (!isActivated) {
        return reply
          .code(404)
          .send({ error: 'User not found or already activated' });
      }

      reply.send({ message: 'User account activated successfully' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to activate user account' });
    }
  }

  static async createUserPassword(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params as { userId: string };
      const { password } = request.body as { password: string };

      // Validate input
      if (!userId || isNaN(Number(userId))) {
        return reply.code(400).send({ error: 'Valid user ID is required' });
      }

      if (!password) {
        return reply.code(400).send({ error: 'Password is required' });
      }

      // Create user password
      const isCreated = await UserService.createUserPassword(
        Number(userId),
        password
      );

      if (!isCreated) {
        return reply.code(404).send({ error: 'User not found' });
      }

      reply.send({ message: 'User password created successfully' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to create user password' });
    }
  }
}
