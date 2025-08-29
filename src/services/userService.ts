import { AccountActivationTokensRepo } from '../repo/accountActivationTokens';
import { UserPasswordRepo } from '../repo/userPasswords';
import { UserSchoolsRepo } from '../repo/userSchools';
import { UserRepo } from '../repo/user';
import { SchoolRepo } from '../repo/school';
import { db } from '../db';
import { User } from '../models/user';
import { SchoolBase } from '../models/school';
import { UserSchool } from '../models/userSchool';

export type UserWithSchools = User & {
  schools: SchoolBase[];
  userSchoolRoles: UserSchool[];
};

export class UserService {
  static async activateAccountWithPassword(
    token: string,
    password: string
  ): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      // Validate the token first
      const accountToken =
        await AccountActivationTokensRepo.validateActiveToken(token);
      if (!accountToken) {
        return {
          success: false,
          error: 'Invalid or expired activation token',
        };
      }

      const userId = accountToken.userId;
      const schoolId = accountToken.schoolId;

      const existingPasswords = await UserPasswordRepo.findByUserId(userId);
      if (existingPasswords && existingPasswords.length > 0) {
        return {
          success: false,
          error:
            'Account already activated. Please use password reset if needed.',
        };
      }

      return await db.transaction(async tx => {
        try {
          const isActivated = await UserSchoolsRepo.activateUserForSchool(
            userId,
            schoolId
          );
          if (!isActivated) {
            throw new Error('Failed to activate user for school');
          }

          const passwordCreated = await UserPasswordRepo.createPassword(
            userId,
            password
          );
          if (!passwordCreated) {
            throw new Error('Failed to create user password');
          }

          await AccountActivationTokensRepo.deleteTokenByValue(token);

          return {
            success: true,
            userId: userId,
          };
        } catch (error) {
          // Transaction will automatically rollback
          throw error;
        }
      });
    } catch (error) {
      console.error('Account activation error:', error);
      return {
        success: false,
        error: 'Failed to activate account. Please try again.',
      };
    }
  }

  static async activateUserAccount(
    userId: number,
    accountActivationToken: string
  ): Promise<Boolean | void> {
    // Validate the token
    const accountToken = await AccountActivationTokensRepo.validateActiveToken(
      accountActivationToken
    );
    if (!accountToken) {
      throw new Error('Invalid or expired account activation token');
    }

    console.log(accountToken);

    const successfulActivation = await UserSchoolsRepo.activateUserForSchool(
      userId,
      accountToken.schoolId
    );
    if (!successfulActivation) {
      throw new Error('Failed to activate user for school');
    }

    return true;
  }

  static async createUserPassword(
    userId: number,
    password: string
  ): Promise<Boolean | void> {
    // Validate input
    if (!userId || isNaN(userId)) {
      throw new Error('Valid user ID is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    // if the user already has a password they cannot create a new one. This is only for the FIRST time a user has been activated
    const userPasswords = await UserPasswordRepo.findByUserId(userId);
    if (userPasswords && userPasswords.length > 0) {
      throw new Error(
        'User already has a password please use password reset flow'
      );
    }

    // Create user password
    const isCreated = await UserPasswordRepo.createPassword(userId, password);

    if (!isCreated) {
      throw new Error('Failed to create user password');
    }

    return true;
  }

  static async getUserContext(userId: number): Promise<UserWithSchools | null> {
    const user = await UserRepo.findById(userId);
    if (!user) {
      return null;
    }

    const userSchools = (await UserSchoolsRepo.findByUserId(userId)).map(
      school => {
        return {
          schoolID: school.schoolId,
          role: school.role,
        };
      }
    );

    const userSchoolsIDs = userSchools.map(school => school.schoolID);

    const schools = await SchoolRepo.findByIds(userSchoolsIDs);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      schools: schools.map(school => ({
        id: school.id,
        name: school.name,
        phone: school.phone,
        website: school.website,
        logo: school.logo,
        supportEmail: school.supportEmail,
        onboardingStatus: school.onboardingStatus,
      })),
      userSchoolRoles: userSchools,
    };
  }
}
