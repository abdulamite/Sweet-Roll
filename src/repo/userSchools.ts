import { db } from '../db';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { userSchools } from '../db/schema';
import { safeQuery, softDelete } from '../db/queryBuilder';
import { and, eq } from 'drizzle-orm';
import { UserRepo } from './user';

export class UserSchoolsRepo {
  constructor(private db: PostgresJsDatabase) {}

  static async activateUserForSchool(
    userId: number,
    schoolId: number
  ): Promise<Boolean | void> {
    if (!userId) throw new Error('User ID is required');
    if (!schoolId) throw new Error('School ID is required');
    console.log(`Activating user ${userId} for school ${schoolId}`);
    const userSchool = await safeQuery
      .selectUserSchools()
      .where(
        and(eq(userSchools.userId, userId), eq(userSchools.schoolId, schoolId))
      );

    console.log(userSchool);
    if (userSchool.length === 0) {
      throw new Error('User is not associated with the school');
    }

    await db
      .update(userSchools)
      .set({ isActive: true })
      .where(
        and(eq(userSchools.userId, userId), eq(userSchools.schoolId, schoolId))
      )
      .execute();
    return true;
  }

  static async findByUserId(userId: number): Promise<any[]> {
    if (!userId) throw new Error('User ID is required');

    return await safeQuery
      .selectUserSchools()
      .where(eq(userSchools.userId, userId));
  }
}
