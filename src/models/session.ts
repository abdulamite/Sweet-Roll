export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
}
