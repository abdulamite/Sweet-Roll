// Auth middleware example
import { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionByToken } from '../repo/auth';

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

  // TODO: Implement user context retrieval
  // const userContext = await getUserContext(sessionData.user_id);
  // if (!userContext) {
  //   return reply.code(401).send({ error: 'Unauthorized' });
  // }
  (request as any).user = {
    id: sessionData.userId,
  }; // Placeholder
}
