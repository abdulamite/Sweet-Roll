import { AccountActivationTokensRepo } from '../repo/accountActivationTokens';
import { UserPasswordRepo } from '../repo/userPasswords';
import { UserSchoolsRepo } from '../repo/userSchools';

export class UserService {
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
}
