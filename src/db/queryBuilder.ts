import { SQL, and, isNull, eq } from 'drizzle-orm';
import { db } from './index';
import { users, userPasswords, userSessions } from './schema';

// Generic soft delete filters for each table
export const softDeleteFilters = {
  users: () => isNull(users.deletedAt),
  userPasswords: () => isNull(userPasswords.deletedAt),
  userSessions: () => isNull(userSessions.deletedAt),
};

// Wrapper functions for common queries with soft delete filtering
export const safeQuery = {
  // Select users (excluding soft deleted)
  selectUsers: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = softDeleteFilters.users();
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;

      return db.select().from(users).where(finalCondition);
    },
    // Include soft deleted records
    withDeleted: (condition?: SQL) => {
      return condition
        ? db.select().from(users).where(condition)
        : db.select().from(users);
    },
  }),

  // Select user passwords (excluding soft deleted)
  selectUserPasswords: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = softDeleteFilters.userPasswords();
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;

      return db.select().from(userPasswords).where(finalCondition);
    },
  }),

  // Select user sessions (excluding soft deleted)
  selectUserSessions: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = softDeleteFilters.userSessions();
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;

      return db.select().from(userSessions).where(finalCondition);
    },
  }),

  selectUserRoles: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = softDeleteFilters.users();
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;

      return db.select().from(users).where(finalCondition);
    },
  }),
};

// Soft delete functions
export const softDelete = {
  user: (id: number) =>
    db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt))),

  userPassword: (id: number) =>
    db
      .update(userPasswords)
      .set({ deletedAt: new Date() })
      .where(and(eq(userPasswords.id, id), isNull(userPasswords.deletedAt))),

  userSession: (id: number) =>
    db
      .update(userSessions)
      .set({ deletedAt: new Date() })
      .where(and(eq(userSessions.id, id), isNull(userSessions.deletedAt))),
};
