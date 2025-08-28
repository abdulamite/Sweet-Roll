import { db } from '../db';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { accountActivationTokens } from '../db/schema';
import { safeQuery, softDelete } from '../db/queryBuilder';
import { AccountActivationToken } from '../models/accountActivationToken';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import shortid from 'shortid';

export class AccountActivationTokensRepo {
  constructor(private db: PostgresJsDatabase) {}

  static async createToken(userId: number, schoolId: number): Promise<string> {
    if (!userId) throw new Error('User ID is required');
    if (!schoolId) throw new Error('School ID is required');

    const plainToken = shortid.generate();
    const hashedToken = await hashToken(plainToken);

    const [newAccountActivationToken] = await db
      .insert(accountActivationTokens)
      .values({
        userId: userId,
        schoolId: schoolId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 24 hour expiry
      })
      .returning();

    if (!newAccountActivationToken || !newAccountActivationToken.token) {
      throw new Error('Failed to create account activation token');
    }

    return plainToken;
  }

  static async validateActiveToken(
    accountActivationToken: string
  ): Promise<AccountActivationToken | null> {
    if (!accountActivationToken)
      throw new Error('Account activation token is required');

    const hashedToken = await hashToken(accountActivationToken);

    const activeTokens = await safeQuery
      .selectAccountActivationTokens()
      .where(eq(accountActivationTokens.token, hashedToken))
      .limit(1);
    if (activeTokens.length === 0) return null;

    const dbToken = activeTokens[0];
    if (!dbToken.token || dbToken.expiresAt < new Date()) return null;

    const token: AccountActivationToken = {
      userId: dbToken.userId,
      schoolId: dbToken.schoolId,
      token: dbToken.token,
      expiresAt: dbToken.expiresAt,
    };

    return token;
  }

  static async deleteToken(id: number): Promise<void> {
    const result = await softDelete.userActivationToken(id).returning();
    if (result.length === 0) {
      throw new Error('Failed to delete account activation token');
    }
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
