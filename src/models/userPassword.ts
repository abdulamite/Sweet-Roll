import { BaseModel } from './baseMode';
export interface UserPassword extends BaseModel {
  userId: number;
  hashedPassword: string;
}
