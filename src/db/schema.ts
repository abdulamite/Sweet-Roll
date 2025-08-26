import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

const baseModel = {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
};

export const users = pgTable('users', {
  ...baseModel,
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
});

export const userPasswords = pgTable('user_passwords', {
  ...baseModel,
  userId: serial('user_id').references(() => users.id),
  hashedPassword: varchar('hashed_password', { length: 255 }),
});

export const userSessions = pgTable('user_sessions', {
  ...baseModel,
  userId: serial('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 255 }),
  expiresAt: timestamp('expires_at'),
});

export const userRoles = pgTable('user_roles', {
  ...baseModel,
  userId: serial('user_id').references(() => users.id),
  role: varchar('role', { enum: ['admin', 'parent', 'teacher'] }),
});

export const schools = pgTable('schools', {
  ...baseModel,
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
  logo: varchar('logo', { length: 255 }), //location of school logo in aws s3
  website: varchar('website', { length: 255 }),
  supportEmail: varchar('support_email', { length: 255 }),
  onboardingStatus: varchar('onboarding_status', {
    enum: ['pending', 'completed', 'in_progress'],
  }),
});

export const schoolAddress = pgTable('school_address', {
  ...baseModel,
  schoolId: serial('school_id').references(() => schools.id),
  street: varchar('street', { length: 255 }),
  street2: varchar('street2', { length: 255 }),
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 255 }),
  zipCode: varchar('zip_code', { length: 255 }),
});

export const schoolOwner = pgTable('school_owner', {
  ...baseModel,
  schoolId: serial('school_id').references(() => schools.id),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
});
