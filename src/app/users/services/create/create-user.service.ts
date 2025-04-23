import { Injectable } from '@nestjs/common';
import UserRequestModel from '../../models/user-request.model';
import UserResponseModel from '../../models/user-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: UserRequestModel): Promise<UserResponseModel> {
    const newUser = new User();

    Object.assign(newUser, user);

    const response = await this.usersRepository.save(newUser);

    return new UserResponseModel(response);
  }
}
