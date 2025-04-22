import { Injectable } from '@nestjs/common';
import UserRequestModel from '../../models/user-request.model';
import UserResponseModel from '../../models/user-response.model';

@Injectable()
export class CreateUserService {
  constructor() {}

  create(user: UserRequestModel): Promise<UserResponseModel> {
    console.log(user);
    throw new Error('Method not implemented.');
  }
}
