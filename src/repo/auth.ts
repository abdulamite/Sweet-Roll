import { db } from '../db';
import { userPasswords, userSessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { safeQuery, softDelete } from '../db/queryBuilder';

export const getUserPasswordByUserID = async (
  userID: number
): Promise<string | null> => {
  const result = await safeQuery
    .selectUserPasswords()
    .where(eq(userPasswords.userId, userID));
  if (!result[0]) return null;
  return result[0].hashedPassword;
};

export const setUserSessionToken = async (
  userID: number,
  token: string
): Promise<void> => {
  await db.insert(userSessions).values({
    userId: userID,
    sessionToken: token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
};

export const getSessionByToken = async (
  token: string
): Promise<{ id: number; userId: number; expires_at: Date } | null> => {
  const result = await safeQuery
    .selectUserSessions()
    .where(eq(userSessions.sessionToken, token));
  if (result.length === 0) return null;
  if (!result[0] || !result[0].expiresAt) return null;
  return {
    id: result[0].id,
    userId: result[0].userId,
    expires_at: result[0].expiresAt,
  };
};

export const invalidateSessionByID = async (id: number): Promise<void> => {
  await softDelete.userSession(id);
};
