import { FastifyRequest, FastifyReply } from 'fastify';
import { hashUserPassword, UserRepo } from '../repo/user';
import {
  getUserPasswordByUserID,
  setUserSessionToken,
  getSessionByToken,
  invalidateSessionByID,
} from '../repo/auth';

export class AuthHandler {
  /**
   * Handle user login - public route
   */
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      // Validate input
      if (!email || !password) {
        return reply
          .code(400)
          .send({ error: 'Email and password are required' });
      }

      // Get user by email
      const user = await UserRepo.findByEmail(email);
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Get stored password hash
      const hashedUserPasswordFromDB = await getUserPasswordByUserID(user.id);

      // Verify password
      const hashedPassword = hashUserPassword(password);
      if (hashedPassword !== hashedUserPasswordFromDB) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Create session token
      const sessionToken = `session_${user.id}_${Date.now()}`;
      await setUserSessionToken(user.id, sessionToken);

      // Set authenticated session cookie
      reply.setCookie('authenticated_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      reply.send({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Login failed' });
    }
  }

  /**
   * Handle user logout - protected route
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.cookies.authenticated_session) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const sessionToken = await getSessionByToken(
        request.cookies.authenticated_session
      );

      if (!sessionToken) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      // Invalidate session
      await invalidateSessionByID(sessionToken.id);

      // Clear cookie
      reply.clearCookie('authenticated_session', { path: '/' });
      reply.send({ message: 'Logout successful' });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Logout failed' });
    }
  }
}
