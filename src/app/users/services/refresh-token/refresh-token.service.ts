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

  async getRefreshToken(userId: string): Promise<string | undefined> {
    const user = await this.repository.findOneBy({ id: userId });

    if (!user) return undefined;

    return user.refreshToken;
  }
}
