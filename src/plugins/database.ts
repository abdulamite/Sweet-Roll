import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { db } from '../db';
import {
  users,
  userPasswords,
  schools,
  schoolAddress,
  schoolOwner,
  userSchools,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import {
  User,
  School,
  OnboardingFormData,
  SCHOOL_ONBOARDING_STATUS,
} from '../types';

// Database service plugin
async function dbService(fastify: FastifyInstance) {
  // User services
  const userService = {
    async getById(id: number): Promise<User | null> {
      const result = await db.select().from(users).where(eq(users.id, id));
      if (!result[0]) return null;
      return {
        id: result[0].id,
        name: result[0].name ?? '',
        email: result[0].email ?? '',
      };
    },

    async getByEmail(email: string): Promise<User | null> {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (!result[0]) return null;
      return {
        id: result[0].id,
        name: result[0].name ?? '',
        email: result[0].email ?? '',
      };
    },

    async create(userData: Omit<User, 'id'>): Promise<User> {
      const [newUser] = await db.insert(users).values(userData).returning();
      return {
        id: newUser.id,
        name: newUser.name ?? '',
        email: newUser.email ?? '',
      };
    },

    async createPassword(userId: number, password: string): Promise<void> {
      const hashedPassword = createHash('sha512')
        .update(password)
        .digest('hex');
      await db.insert(userPasswords).values({
        userId,
        hashedPassword,
      });
    },
  };

  // School services
  const schoolService = {
    async create(formData: OnboardingFormData): Promise<School> {
      return await db.transaction(async tx => {
        // Create school
        const [newSchool] = await tx
          .insert(schools)
          .values({
            name: formData.name,
            phone: formData.phone,
            website: formData.website,
            logo: null,
            supportEmail: formData.supportEmail,
            onboardingStatus: SCHOOL_ONBOARDING_STATUS.PENDING,
          })
          .returning();

        // Create school address
        await tx.insert(schoolAddress).values({
          schoolId: newSchool.id,
          street: formData.address.street,
          street2: formData.address.street2,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
        });

        // Create school owner
        await tx.insert(schoolOwner).values({
          schoolId: newSchool.id,
          name: formData.businessOwnerInformation.name,
          email: formData.businessOwnerInformation.email,
          phone: formData.businessOwnerInformation.phone,
        });

        // Create owner user account
        const [ownerUser] = await tx
          .insert(users)
          .values({
            name: formData.businessOwnerInformation.name,
            email: formData.businessOwnerInformation.email,
          })
          .returning();

        // Link user to school with admin role
        await tx.insert(userSchools).values({
          userId: ownerUser.id,
          schoolId: newSchool.id,
          role: 'admin',
          permissions: [],
          isActive: true,
        });

        return {
          id: newSchool.id,
          name: newSchool.name ?? '',
          phone: newSchool.phone ?? '',
          logo: newSchool.logo,
          website: newSchool.website ?? '',
          supportEmail: newSchool.supportEmail ?? '',
          onboardingStatus: newSchool.onboardingStatus ?? 'pending',
        };
      });
    },
  };

  // Register services
  fastify.decorate('db', {
    users: userService,
    schools: schoolService,
  });
}

export default fp(dbService);
