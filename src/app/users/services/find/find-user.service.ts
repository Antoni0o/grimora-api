import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import UserResponseModel from '../../models/user-response.model';

@Injectable()
export default class FindUserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserResponseModel> {
    const user = await this.repository.findOneBy({ id });

    if (user === null) throw new NotFoundException('User not found');

    return new UserResponseModel(user);
  }

  async findByEmail(email: string): Promise<UserResponseModel> {
    const user = await this.repository.findOneBy({ email });

    if (user === null) throw new NotFoundException('User not found');

    return new UserResponseModel(user);
  }
}
