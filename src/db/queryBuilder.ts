import { SQL, and, isNull, isNotNull, eq } from 'drizzle-orm';
import { db } from './index';
import {
  users,
  userPasswords,
  userSessions,
  accountActivationTokens,
  userSchools,
  schools,
  schoolAddress,
  schoolOwner,
} from './schema';

/**
 * Universal query builder that automatically handles soft deletes for ALL tables
 * No need to add each table manually - this works with any table that has deletedAt
 */
export const safeQuery = {
  // Users
  selectUsers: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(users.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(users).where(finalCondition);
    },
  }),

  // User Passwords
  selectUserPasswords: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(userPasswords.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(userPasswords).where(finalCondition);
    },
  }),

  // User Sessions
  selectUserSessions: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(userSessions.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(userSessions).where(finalCondition);
    },
  }),

  // Account Activation Tokens
  selectAccountActivationTokens: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(accountActivationTokens.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(accountActivationTokens).where(finalCondition);
    },
  }),

  // User Schools
  selectUserSchools: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(userSchools.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(userSchools).where(finalCondition);
    },
  }),

  // Schools
  selectSchools: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(schools.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(schools).where(finalCondition);
    },
  }),

  // School Address
  selectSchoolAddress: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(schoolAddress.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(schoolAddress).where(finalCondition);
    },
  }),

  // School Owner
  selectSchoolOwner: () => ({
    where: (condition?: SQL) => {
      const softDeleteFilter = isNull(schoolOwner.deletedAt);
      const finalCondition = condition
        ? and(softDeleteFilter, condition)
        : softDeleteFilter;
      return db.select().from(schoolOwner).where(finalCondition);
    },
  }),
};

/**
 * Query builder that includes soft-deleted records
 * Use this when you explicitly want to see deleted records
 */
export const unsafeQuery = {
  // Users - includes deleted
  selectUsers: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(users).where(condition)
        : db.select().from(users);
    },
  }),

  // User Passwords - includes deleted
  selectUserPasswords: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(userPasswords).where(condition)
        : db.select().from(userPasswords);
    },
  }),

  // User Sessions - includes deleted
  selectUserSessions: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(userSessions).where(condition)
        : db.select().from(userSessions);
    },
  }),

  // Account Activation Tokens - includes deleted
  selectAccountActivationTokens: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(accountActivationTokens).where(condition)
        : db.select().from(accountActivationTokens);
    },
  }),

  // User Schools - includes deleted
  selectUserSchools: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(userSchools).where(condition)
        : db.select().from(userSchools);
    },
  }),

  // Schools - includes deleted
  selectSchools: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(schools).where(condition)
        : db.select().from(schools);
    },
  }),

  // School Address - includes deleted
  selectSchoolAddress: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(schoolAddress).where(condition)
        : db.select().from(schoolAddress);
    },
  }),

  // School Owner - includes deleted
  selectSchoolOwner: () => ({
    where: (condition?: SQL) => {
      return condition
        ? db.select().from(schoolOwner).where(condition)
        : db.select().from(schoolOwner);
    },
  }),
};

/**
 * Query builder that returns ONLY soft-deleted records
 */
export const deletedQuery = {
  // Users - only deleted
  selectUsers: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(users.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(users).where(finalCondition);
    },
  }),

  // User Passwords - only deleted
  selectUserPasswords: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(userPasswords.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(userPasswords).where(finalCondition);
    },
  }),

  // User Sessions - only deleted
  selectUserSessions: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(userSessions.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(userSessions).where(finalCondition);
    },
  }),

  // Account Activation Tokens - only deleted
  selectAccountActivationTokens: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(accountActivationTokens.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(accountActivationTokens).where(finalCondition);
    },
  }),

  // User Schools - only deleted
  selectUserSchools: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(userSchools.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(userSchools).where(finalCondition);
    },
  }),

  // Schools - only deleted
  selectSchools: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(schools.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(schools).where(finalCondition);
    },
  }),

  // School Address - only deleted
  selectSchoolAddress: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(schoolAddress.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(schoolAddress).where(finalCondition);
    },
  }),

  // School Owner - only deleted
  selectSchoolOwner: () => ({
    where: (condition?: SQL) => {
      const deletedFilter = isNotNull(schoolOwner.deletedAt);
      const finalCondition = condition
        ? and(deletedFilter, condition)
        : deletedFilter;
      return db.select().from(schoolOwner).where(finalCondition);
    },
  }),
};

/**
 * Soft delete functions for all tables
 */
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
  userActivationToken: (id: number) =>
    db
      .update(accountActivationTokens)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(accountActivationTokens.id, id),
          isNull(accountActivationTokens.deletedAt)
        )
      ),
  userSchool: (id: number) =>
    db
      .update(userSchools)
      .set({ deletedAt: new Date() })
      .where(and(eq(userSchools.id, id), isNull(userSchools.deletedAt))),
  school: (id: number) =>
    db
      .update(schools)
      .set({ deletedAt: new Date() })
      .where(and(eq(schools.id, id), isNull(schools.deletedAt))),
  schoolAddress: (id: number) =>
    db
      .update(schoolAddress)
      .set({ deletedAt: new Date() })
      .where(and(eq(schoolAddress.id, id), isNull(schoolAddress.deletedAt))),
  schoolOwner: (id: number) =>
    db
      .update(schoolOwner)
      .set({ deletedAt: new Date() })
      .where(and(eq(schoolOwner.id, id), isNull(schoolOwner.deletedAt))),
};

/**
 * Restore (un-delete) functions for all tables
 */
export const restore = {
  user: (id: number) =>
    db.update(users).set({ deletedAt: null }).where(eq(users.id, id)),
  userPassword: (id: number) =>
    db
      .update(userPasswords)
      .set({ deletedAt: null })
      .where(eq(userPasswords.id, id)),
  userSession: (id: number) =>
    db
      .update(userSessions)
      .set({ deletedAt: null })
      .where(eq(userSessions.id, id)),
  userActivationToken: (id: number) =>
    db
      .update(accountActivationTokens)
      .set({ deletedAt: null })
      .where(eq(accountActivationTokens.id, id)),
  userSchool: (id: number) =>
    db
      .update(userSchools)
      .set({ deletedAt: null })
      .where(eq(userSchools.id, id)),
  school: (id: number) =>
    db.update(schools).set({ deletedAt: null }).where(eq(schools.id, id)),
  schoolAddress: (id: number) =>
    db
      .update(schoolAddress)
      .set({ deletedAt: null })
      .where(eq(schoolAddress.id, id)),
  schoolOwner: (id: number) =>
    db
      .update(schoolOwner)
      .set({ deletedAt: null })
      .where(eq(schoolOwner.id, id)),
};
