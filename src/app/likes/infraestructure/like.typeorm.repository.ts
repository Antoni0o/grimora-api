import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeRepository } from '../domain/repositories/like.repository';
import { Like } from '../domain/entities/like.entity';
import { BaseLikeEntity } from './entities/base-like.entity';
import { LikeMapper } from './like.mapper';

@Injectable()
export class LikeTypeormRepository implements LikeRepository {
  constructor(
    @InjectRepository(BaseLikeEntity)
    private readonly repository: Repository<BaseLikeEntity>,
  ) {}

  async create(like: Like): Promise<Like> {
    const entity = LikeMapper.toEntity(like);
    const saved = await this.repository.save(entity);
    return LikeMapper.toDomain(saved);
  }

  async delete(userId: string, entityId: string, entityType: string): Promise<void> {
    await this.repository.delete({
      userId,
      entityId,
      entityType,
    });
  }

  async findByUserAndEntity(userId: string, entityId: string, entityType: string): Promise<Like | null> {
    const entity = await this.repository.findOne({
      where: {
        userId,
        entityId,
        entityType,
      },
    });

    return entity ? LikeMapper.toDomain(entity) : null;
  }

  async countByEntity(entityId: string, entityType: string): Promise<number> {
    return this.repository.count({
      where: {
        entityId,
        entityType,
      },
    });
  }
  async findAllByUserAndEntityType(userId: string, entityType: string): Promise<Like[]> {
    const entities = await this.repository.find({
      where: {
        userId,
        entityType,
      },
    });
    return entities.map(entity => LikeMapper.toDomain(entity));
  }

  async deleteAllByEntity(entityType: string, entityId: string): Promise<void> {
    await this.repository.delete({
      entityType,
      entityId,
    });
  }
}
