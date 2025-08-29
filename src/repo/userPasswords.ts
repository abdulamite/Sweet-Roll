import { db } from '../db';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { userPasswords } from '../db/schema';
import { safeQuery } from '../db/queryBuilder';
import { UserPassword } from '../models/userPassword';
import { hashUserPassword } from './user';
import { eq } from 'drizzle-orm';

export const passwordRules = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
};

export class UserPasswordRepo {
  constructor(private db: PostgresJsDatabase) {}

  static async findByUserId(userId: number): Promise<UserPassword[] | null> {
    if (!userId || isNaN(userId)) {
      throw new Error('Valid user ID is required');
    }

    const userPasswordsResult = await safeQuery
      .selectUserPasswords()
      .where(eq(userPasswords.userId, userId));

    return userPasswordsResult;
  }

  static async createPassword(
    userId: number,
    password: string
  ): Promise<boolean> {
    if (!userId || isNaN(userId)) {
      throw new Error('Valid user ID is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await hashUserPassword(password);
    const [result] = await db
      .insert(userPasswords)
      .values({
        userId,
        hashedPassword,
      })
      .returning();

    if (!result.id) {
      throw new Error('Failed to create user password');
    }

    return true;
  }
}

export const rawPasswordIsValid = (password: string): boolean => {
  if (!password) return false;

  const {
    minLength,
    maxLength,
    requireUppercase,
    requireLowercase,
    requireNumber,
    requireSpecialCharacter,
  } = passwordRules;

  if (password.length < minLength || password.length > maxLength) return false;

  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumber && !/[0-9]/.test(password)) return false;
  if (requireSpecialCharacter && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return false;

  return true;
};
