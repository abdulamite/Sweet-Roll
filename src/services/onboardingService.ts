import { db } from '../db';
import { User } from '../models/user';
import {
  OnboardingFormDataSchool as School,
  SCHOOL_ONBOARDING_STATUS,
} from '../models/school';
import { UserRepository, UserCreationData } from '../repo/user';
import {
  users,
  userSchools,
  schools,
  schoolAddress,
  schoolOwner,
} from '../db/schema';
import { AccountActivationTokensRepo } from '../repo/accountActivationTokens';
export class OnboardingService {
  /**
   * Create a new school with an admin user during onboarding
   * This orchestrates the entire onboarding process including:
   * - School creation
   * - Admin user creation
   * - User-school role assignment
   */
  static async createSchoolWithAdmin(
    schoolData: Omit<School, 'id'>
  ): Promise<{ school: School; adminUser: User }> {
    return await db.transaction(async tx => {
      // Validate school data first
      const validationErrors = OnboardingService.validateSchoolData(schoolData);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid school data: ${validationErrors.join(', ')}`);
      }

      // Create school within transaction
      const schoolInput = {
        name: schoolData.name,
        phone: schoolData.phone,
        website: schoolData.website,
        logo: null,
        supportEmail: schoolData.supportEmail,
        onboardingStatus: SCHOOL_ONBOARDING_STATUS.PENDING,
      };

      const [newSchool] = await tx
        .insert(schools)
        .values(schoolInput)
        .returning();

      // Create school address within same transaction
      const [newSchoolAddress] = await tx
        .insert(schoolAddress)
        .values({
          street: schoolData.address.street,
          street2: schoolData.address.street2,
          city: schoolData.address.city,
          state: schoolData.address.state,
          zipCode: schoolData.address.zipCode,
          schoolId: newSchool.id,
        })
        .returning();

      // Create school owner entry within same transaction
      const [newSchoolOwner] = await tx
        .insert(schoolOwner)
        .values({
          schoolId: newSchool.id,
          name: schoolData.businessOwnerInformation.name,
          email: schoolData.businessOwnerInformation.email,
          phone: schoolData.businessOwnerInformation.phone,
        })
        .returning();

      // Create the admin user with school role
      const adminUser = await OnboardingService.createSchoolUserWithRoleInTx(
        tx,
        {
          email: schoolData.businessOwnerInformation.email,
          name: schoolData.businessOwnerInformation.name,
        },
        'admin',
        newSchool.id
      );

      // Validate all operations succeeded
      if (!newSchoolAddress || !newSchool || !newSchoolOwner || !adminUser) {
        throw new Error(
          'Failed to create school - one or more operations failed'
        );
      }

      const school: School = {
        id: newSchool.id,
        name: newSchool.name ?? '',
        phone: newSchool.phone ?? '',
        logo: null,
        website: newSchool.website ?? '',
        supportEmail: newSchool.supportEmail ?? '',
        onboardingStatus: newSchool.onboardingStatus ?? 'pending',
        businessOwnerInformation: schoolData.businessOwnerInformation ?? {
          name: '',
          email: '',
          phone: '',
        },
        createdAt: newSchool.createdAt ?? new Date(),
        updatedAt: newSchool.updatedAt ?? new Date(),
        deletedAt: newSchool.deletedAt ?? new Date(),
        address: newSchoolAddress
          ? {
              street: newSchoolAddress.street ?? '',
              street2: newSchoolAddress.street2 ?? '',
              city: newSchoolAddress.city ?? '',
              state: newSchoolAddress.state ?? '',
              zipCode: newSchoolAddress.zipCode ?? '',
            }
          : {
              street: '',
              street2: '',
              city: '',
              state: '',
              zipCode: '',
            },
      };

      return { school, adminUser };
    });
  }

  /**
   * Create a new user with a specific role for a school
   * This is the main business logic for user-school relationships
   */
  static async createSchoolUserWithRole(
    userData: UserCreationData,
    role: string,
    schoolId: number
  ): Promise<User> {
    return await db.transaction(async tx => {
      return await OnboardingService.createSchoolUserWithRoleInTx(
        tx,
        userData,
        role,
        schoolId
      );
    });
  }

  /**
   * Internal transaction-aware method for creating users with school roles
   * This can be used within existing transactions
   */
  private static async createSchoolUserWithRoleInTx(
    tx: any, // Transaction context
    userData: UserCreationData,
    role: string,
    schoolId: number
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    // Create user within transaction
    const [newUser] = await tx.insert(users).values(userData).returning();

    // Create user-school relationship within same transaction
    await tx
      .insert(userSchools)
      .values({
        userId: newUser.id,
        schoolId: schoolId,
        role: role as 'admin' | 'parent' | 'teacher',
        permissions: [],
        isActive: false,
      })
      .returning();

    return {
      id: newUser.id,
      name: newUser.name ?? '',
      email: newUser.email ?? '',
      createdAt: newUser.createdAt ?? new Date(),
      updatedAt: newUser.updatedAt ?? new Date(),
      deletedAt: newUser.deletedAt ?? new Date(),
    };
  }

  /**
   * Get onboarding status for a user
   * Business logic to determine completion status
   */
  static async getOnboardingStatus(userId: number): Promise<{
    userId: number;
    isComplete: boolean;
    steps: {
      profileSetup: boolean;
      emailVerification: boolean;
      preferences: boolean;
    };
  }> {
    // TODO: Implement actual business logic to check onboarding completion
    // This could check various flags in the database, user profile completeness, etc.

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Placeholder logic - replace with actual business rules
    return {
      userId,
      isComplete: false,
      steps: {
        profileSetup: !!user.name && !!user.email,
        emailVerification: false, // Check email verification status
        preferences: false, // Check if user has set preferences
      },
    };
  }

  /**
   * Validate onboarding form data
   * Centralized validation for onboarding forms
   */
  static validateOnboardingFormData(data: Omit<School, 'id'>): string[] {
    return OnboardingService.validateSchoolData(data);
  }

  /**
   * Validate school data for creation
   * Internal validation method
   */
  private static validateSchoolData(schoolData: Omit<School, 'id'>): string[] {
    const errors: string[] = [];

    // Validate school basic info
    if (!schoolData.name) {
      errors.push('School name is required');
    }
    if (!schoolData.phone) {
      errors.push('School phone is required');
    }
    if (!schoolData.website) {
      errors.push('School website is required');
    }
    if (!schoolData.supportEmail) {
      errors.push('School support email is required');
    }

    // Validate address
    if (!schoolData.address) {
      errors.push('School address is required');
    } else {
      if (!schoolData.address.street) {
        errors.push('Address street is required');
      }
      if (!schoolData.address.city) {
        errors.push('Address city is required');
      }
      if (!schoolData.address.state) {
        errors.push('Address state is required');
      }
      if (!schoolData.address.zipCode) {
        errors.push('Address zip code is required');
      }
    }

    // Validate business owner information
    if (!schoolData.businessOwnerInformation) {
      errors.push('Business owner information is required');
    } else {
      if (!schoolData.businessOwnerInformation.name) {
        errors.push('Business owner name is required');
      }
      if (!schoolData.businessOwnerInformation.email) {
        errors.push('Business owner email is required');
      }
      if (!schoolData.businessOwnerInformation.phone) {
        errors.push('Business owner phone is required');
      }
    }

    return errors;
  }
}
