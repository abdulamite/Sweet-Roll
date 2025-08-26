import { User } from '../models/user';
import { db } from '../db';
import { userPasswords, users } from '../db/schema';
import { eq, isNull } from 'drizzle-orm';
import { createHash } from 'crypto';
import { safeQuery, softDelete } from '../db/queryBuilder';

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await safeQuery.selectUsers().where(eq(users.id, id));
  if (!result[0]) return null;
  const user = result[0];
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
  };
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await safeQuery.selectUsers().where(eq(users.email, email));
  if (!result[0]) return null;
  const user = result[0];
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await safeQuery.selectUsers().where();
  return result.map(user => ({
    id: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
  }));
};

export const createNewUser = async (
  userData: Omit<User, 'id'>
): Promise<User> => {
  if (!userData.password) {
    throw new Error('Password is required to create a new user.');
  }

  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  const [newUser] = await db.insert(users).values(userData).returning();
  await db
    .insert(userPasswords)
    .values({
      userId: newUser.id,
      hashedPassword: hashUserPassword(userData.password),
    })
    .returning();
  return {
    id: newUser.id,
    name: newUser.name ?? '',
    email: newUser.email ?? '',
  };
};

export const deleteUserById = async (id: number): Promise<boolean> => {
  const result = await softDelete.user(id).returning();
  return result.length > 0;
};

export function hashUserPassword(password: string): string {
  return createHash('sha512').update(password).digest('hex');
}
