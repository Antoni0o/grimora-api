import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { LikeRepository } from '../domain/repositories/like.repository';
import { Like } from '../domain/entities/like.entity';
import { LIKE_REPOSITORY } from '../domain/constants/like.constants';
import { LikeCountResponseDto } from './dto/like-count-response.dto';

@Injectable()
export class LikesService {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: LikeRepository,
  ) {}

  async addLike(userId: string, entityId: string, entityType: string): Promise<void> {
    const existingLike = await this.likeRepository.findByUserAndEntity(userId, entityId, entityType);

    if (existingLike) {
      throw new ConflictException('User has already liked this entity');
    }

    const like = new Like(userId, entityId, entityType);
    await this.likeRepository.create(like);
  }

  async deleteLike(userId: string, entityId: string, entityType: string): Promise<void> {
    const existingLike = await this.likeRepository.findByUserAndEntity(userId, entityId, entityType);

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.delete(userId, entityId, entityType);
  }

  async getLikeCount(entityId: string, entityType: string): Promise<LikeCountResponseDto> {
    const count = await this.likeRepository.countByEntity(entityId, entityType);
    return new LikeCountResponseDto(count);
  }

  async getAllUserLikesForEntityType(userId: string, entityType: string): Promise<string[]> {
    const likes = await this.likeRepository.findAllByUserAndEntityType(userId, entityType);
    return likes.map(like => like.entityId);
  }

  async deleteAllLikesForEntity(entityType: string, entityId: string): Promise<void> {
    await this.likeRepository.deleteAllByEntity(entityType, entityId);
  }
}
