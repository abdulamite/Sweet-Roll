export interface AccountActivationToken {
  userId: number;
  schoolId: number;
  token: string;
  expiresAt: Date;
}
