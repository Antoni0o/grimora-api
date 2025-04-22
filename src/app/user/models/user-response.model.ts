export default class UserResponseModel {
  id!: string;
  email!: string;
  name!: string;
  password?: string;
  refreshToken?: string;

  constructor(partial: Partial<UserResponseModel>) {
    Object.assign(this, partial);
  }
}
