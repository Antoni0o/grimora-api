import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserService } from './services/create/create-user.service';
import FindUserService from './services/find/find-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, FindUserService, CreateUserService],
  exports: [UsersService, FindUserService, CreateUserService],
})
export class UsersModule {}
