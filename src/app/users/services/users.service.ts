import { Injectable } from '@nestjs/common';
import UserResponseModel from '../models/user-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
