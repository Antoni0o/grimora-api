import { Entity, TableInheritance } from 'typeorm';
import { BaseLikeEntity } from './base-like.entity';

@Entity('likes_systems')
@TableInheritance({ column: { type: 'varchar', name: 'entity_type' } })
export class SystemLikeEntity extends BaseLikeEntity {}
