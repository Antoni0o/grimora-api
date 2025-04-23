import { Injectable } from '@nestjs/common';
import UserRequestModel from '../../models/user-request.model';
import UserResponseModel from '../../models/user-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(user: UserRequestModel): Promise<UserResponseModel> {
    const newUser = new User();

    Object.assign(newUser, user);

    const verificationToken = randomBytes(32).toString('hex');
    newUser.verificationToken = verificationToken;

    const response = await this.repository.save(newUser);
    newUser.id = response.id;

    return new UserResponseModel(newUser);
  }
}
