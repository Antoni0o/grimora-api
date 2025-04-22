export default class UserRequestModel {
  email?: string;
  password?: string;
  name?: string;

  constructor(partial: Partial<UserRequestModel>) {
    Object.assign(this, partial);
  }
}
