import { Like } from '../domain/entities/like.entity';
import { BaseLikeEntity } from './entities/base-like.entity';

export class LikeMapper {
  static toDomain(entity: BaseLikeEntity): Like {
    const like = new Like(entity.userId, entity.entityId, entity.entityType);
    like.id = entity.id;
    like.createdAt = entity.createdAt;
    return like;
  }

  static toEntity(domain: Like): BaseLikeEntity {
    const entity = new BaseLikeEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.entityId = domain.entityId;
    entity.entityType = domain.entityType;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
