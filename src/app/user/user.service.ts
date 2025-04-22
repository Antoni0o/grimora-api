import { Injectable } from '@nestjs/common';
import UserResponseModel from './models/user-response.model';
import UserRequestModel from './models/user-request.model';

@Injectable()
export class UserService {
  create(user: UserRequestModel): Promise<void> {
    console.log(user);
    return Promise.resolve();
  }

  findByEmail(email: string): Promise<UserResponseModel> {
    return Promise.resolve(new UserResponseModel({ id: '1', email, name: 'John Doe' }));
  }

  findById(id: string): Promise<UserResponseModel> {
    console.log(`User ID: ${id}`);
    throw new Error('Method not implemented.');
  }

  saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    console.log(`User ID: ${userId}, Refresh Token: ${refreshToken}`);
    return Promise.resolve();
  }

  async getRefreshToken(userId: string): Promise<string | undefined> {
    const user = await this.findById(userId);

    return user?.refreshToken;
  }
}
