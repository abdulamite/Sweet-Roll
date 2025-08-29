import { User } from '../models/user';
import { db } from '../db';
import { userPasswords, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { safeQuery, softDelete } from '../db/queryBuilder';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface UserCreationData {
  name: string;
  email: string;
  password?: string;
}

export class UserRepo {
  constructor(private db: PostgresJsDatabase) {}

  static async findById(id: number): Promise<User | null> {
    const result = await safeQuery.selectUsers().where(eq(users.id, id));
    if (!result[0]) return null;
    const user = result[0];
    return {
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await safeQuery.selectUsers().where(eq(users.email, email));
    if (!result[0]) return null;
    const user = result[0];
    return {
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
    };
  }

  static async findAll(): Promise<User[]> {
    const result = await safeQuery.selectUsers().where();
    return result.map(user => ({
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
    }));
  }

  static async deleteById(id: number): Promise<boolean> {
    const result = await softDelete.user(id).returning();
    return result.length > 0;
  }

  static async create(userData: UserCreationData): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const [newUser] = await db
      .insert(users)
      .values({
        name: userData.name,
        email: userData.email,
      })
      .returning();

    // If password is provided, hash and store it
    if (userData.password) {
      await db.insert(userPasswords).values({
        userId: newUser.id,
        hashedPassword: hashUserPassword(userData.password),
      });
    }

    return {
      id: newUser.id,
      name: newUser.name ?? '',
      email: newUser.email ?? '',
    };
  }
}

export function hashUserPassword(password: string): string {
  return createHash('sha512').update(password).digest('hex');
}
