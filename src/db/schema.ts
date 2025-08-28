import {
  boolean,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const baseModel = {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export const users = pgTable('users', {
  ...baseModel,
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
});

export const userPasswords = pgTable('user_passwords', {
  ...baseModel,
  userId: serial('user_id')
    .references(() => users.id)
    .notNull(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
});

export const userSessions = pgTable('sessions', {
  ...baseModel,
  userId: serial('user_id')
    .references(() => users.id)
    .notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
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
  schoolId: serial('school_id')
    .references(() => schools.id)
    .notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
});

export const userSchools = pgTable('user_schools', {
  ...baseModel,
  schoolId: serial('school_id')
    .references(() => schools.id)
    .notNull(),
  userId: serial('user_id')
    .references(() => users.id)
    .notNull(),
  role: varchar('role', { enum: ['admin', 'parent', 'teacher'] }).notNull(),
  permissions: jsonb('permissions').default([]),
  isActive: boolean('is_active').default(true),
});

export const accountActivationTokens = pgTable('account_activation_tokens', {
  ...baseModel,
  userId: serial('user_id')
    .references(() => users.id)
    .notNull(),
  schoolId: serial('school_id')
    .references(() => schools.id)
    .notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
