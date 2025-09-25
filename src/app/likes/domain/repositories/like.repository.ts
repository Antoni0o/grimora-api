import { Like } from '../entities/like.entity';

export interface LikeRepository {
  create(like: Like): Promise<Like>;
  delete(userId: string, entityId: string, entityType: string): Promise<void>;
  findByUserAndEntity(userId: string, entityId: string, entityType: string): Promise<Like | null>;
  countByEntity(entityId: string, entityType: string): Promise<number>;
  findAllByUserAndEntityType(userId: string, entityType: string): Promise<Like[]>;
  deleteAllByEntity(entityType: string, entityId: string): Promise<void>;
}
