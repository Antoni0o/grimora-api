import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesController } from './application/likes.controller';
import { LikesService } from './application/likes.service';
import { BaseLikeEntity } from './infraestructure/entities/base-like.entity';
import { LIKE_REPOSITORY } from './domain/constants/like.constants';
import { LikeTypeormRepository } from './infraestructure/like.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BaseLikeEntity])],
  controllers: [LikesController],
  providers: [
    LikesService,
    {
      provide: LIKE_REPOSITORY,
      useClass: LikeTypeormRepository,
    },
  ],
  exports: [LikesService],
})
export class LikesModule {}
