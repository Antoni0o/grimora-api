import { IsEmail, IsString, Length } from 'class-validator';

export default class UserRequestModel {
  @IsString()
  @Length(2, 32)
  name?: string;

  @IsEmail()
  @Length(5, 255)
  email?: string;

  @IsString()
  password?: string;

  constructor(partial: Partial<UserRequestModel>) {
    Object.assign(this, partial);
  }
}
