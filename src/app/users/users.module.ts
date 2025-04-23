import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserService } from './services/create/create-user.service';
import FindUserService from './services/find/find-user.service';
import RefreshTokenService from './services/refresh-token/refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [FindUserService, CreateUserService, RefreshTokenService],
  exports: [FindUserService, CreateUserService, RefreshTokenService],
})
export class UsersModule {}
