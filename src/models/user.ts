import { BaseModel } from './baseMode';
export interface User extends BaseModel {
  name: string;
  email: string;
}
