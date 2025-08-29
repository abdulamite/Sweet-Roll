// Auth middleware example
import { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionByToken } from '../repo/auth';
import { UserRepo } from '../repo/user';
import { UserService } from '../services/userService';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionCookie = (request as any).cookies?.authenticated_session;
  if (!sessionCookie) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const sessionData = await getSessionByToken(sessionCookie);
  if (!sessionData) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  if (!sessionData?.expires_at || sessionData.expires_at < new Date()) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const userContext = await UserService.getUserContext(sessionData.userId);
  if (!userContext) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  (request as any).user = {
    ...userContext,
  };

  console.log(userContext);
}
