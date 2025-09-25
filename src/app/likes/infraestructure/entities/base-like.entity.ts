import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('likes_systems')
@Index(['entityId', 'entityType'])
@Unique(['userId', 'entityId', 'entityType'])
export class BaseLikeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  entityId!: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
