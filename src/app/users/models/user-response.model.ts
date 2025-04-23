import { User } from '../entities/user.entity';

export default class UserResponseModel {
  id!: string;
  email!: string;
  name!: string;
  password?: string;
  refreshToken?: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
    this.refreshToken = user.refreshToken;
  }
}
