import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import UserResponseModel from '../../models/user-response.model';

@Injectable()
export default class RefreshTokenService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async saveRefreshToken(userId: string, refreshToken: string): Promise<UserResponseModel> {
    const user = await this.repository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');

    user.refreshToken = refreshToken;
    const updatedUser = await this.repository.save(user);

    return new UserResponseModel(updatedUser);
  }

  getRefreshToken(userId: string): Promise<string | undefined> {
    console.log(`User ID: ${userId}`);
    throw new Error('Method not implemented.');
  }
}
