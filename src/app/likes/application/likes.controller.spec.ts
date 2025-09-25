import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikesModule } from '../likes.module';
import { BaseLikeEntity } from '../infraestructure/entities/base-like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeCountRequestDto } from './dto/like-count-request.dto';
import { UserLikesByEntityRequestDto } from './dto/user-likes-by-entity-request.dto';

describe('LikesController (Integration)', () => {
  let app: TestingModule;
  let controller: LikesController;
  let service: LikesService;
  let dataSource: DataSource;

  const mockSession = {
    user: { id: 'user1' },
  } as any;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [BaseLikeEntity],
          synchronize: true,
          dropSchema: true,
        }),
        LikesModule,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = app.get<LikesController>(LikesController);
    service = app.get<LikesService>(LikesService);
    dataSource = app.get<DataSource>(DataSource);

    await app.init();
  });

  afterEach(async () => {
    await dataSource.getRepository(BaseLikeEntity).clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('addLike', () => {
    it('should add a new like successfully', async () => {
      const dto: CreateLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };

      await controller.addLike(dto, mockSession);

      expect(dto.userId).toBe('user1');

      const likeInDb = await dataSource.getRepository(BaseLikeEntity).findOne({
        where: { userId: 'user1', entityId: 'system1', entityType: 'systems' },
      });

      expect(likeInDb).toBeDefined();
      expect(likeInDb?.userId).toBe('user1');
      expect(likeInDb?.entityId).toBe('system1');
      expect(likeInDb?.entityType).toBe('systems');
    });

    it('should throw ConflictException when user tries to like same entity twice', async () => {
      const dto: CreateLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };

      await controller.addLike(dto, mockSession);

      const duplicateDto: CreateLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };

      await expect(controller.addLike(duplicateDto, mockSession)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteLike', () => {
    it('should delete an existing like successfully', async () => {
      const addDto: CreateLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };
      await controller.addLike(addDto, mockSession);

      const deleteDto: DeleteLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };
      await controller.deleteLike(deleteDto, mockSession);

      const likeInDb = await dataSource.getRepository(BaseLikeEntity).findOne({
        where: { userId: 'user1', entityId: 'system1', entityType: 'systems' },
      });

      expect(likeInDb).toBeNull();
    });

    it('should throw NotFoundException when trying to delete non-existent like', async () => {
      const dto: DeleteLikeDto = {
        userId: '',
        entityId: 'system1',
        entityType: 'systems',
      };

      await expect(controller.deleteLike(dto, mockSession)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLikeCount', () => {
    it('should return correct like count for entity', async () => {
      await createLike('user1', 'system1', 'systems');
      await createLike('user2', 'system1', 'systems');
      await createLike('user3', 'system1', 'systems');
      await createLike('user1', 'system2', 'systems');

      const query: LikeCountRequestDto = {
        entityId: 'system1',
        entityType: 'systems',
      };

      const result = await controller.getLikeCount(query);

      expect(result.count).toBe(3);
    });

    it('should return 0 for entity with no likes', async () => {
      const query: LikeCountRequestDto = {
        entityId: 'nonexistent',
        entityType: 'systems',
      };

      const result = await controller.getLikeCount(query);

      expect(result.count).toBe(0);
    });
  });

  describe('getUserEntityLikes', () => {
    it('should return all entity IDs liked by user', async () => {
      await createLike('user1', 'system1', 'systems');
      await createLike('user1', 'system2', 'systems');
      await createLike('user1', 'system3', 'systems');
      await createLike('user2', 'system4', 'systems');

      const query: UserLikesByEntityRequestDto = {
        userId: '',
        entityType: 'systems',
      };

      const result = await controller.getUserEntityLikes(query, mockSession);

      expect(query.userId).toBe('user1');
      expect(result.entityIds).toHaveLength(3);
      expect(result.entityIds).toEqual(expect.arrayContaining(['system1', 'system2', 'system3']));
      expect(result.entityIds).not.toContain('system4');
    });

    it('should return empty array when user has no likes for entity type', async () => {
      await createLike('user2', 'system1', 'systems');

      const query: UserLikesByEntityRequestDto = {
        userId: '',
        entityType: 'systems',
      };

      const result = await controller.getUserEntityLikes(query, mockSession);

      expect(result.entityIds).toHaveLength(0);
    });

    it('should return only likes for specified entity type', async () => {
      await createLike('user1', 'system1', 'systems');
      await createLike('user1', 'post1', 'posts');
      await createLike('user1', 'system2', 'systems');

      const query: UserLikesByEntityRequestDto = {
        userId: '',
        entityType: 'systems',
      };

      const result = await controller.getUserEntityLikes(query, mockSession);

      expect(result.entityIds).toHaveLength(2);
      expect(result.entityIds).toEqual(expect.arrayContaining(['system1', 'system2']));
      expect(result.entityIds).not.toContain('post1');
    });
  });

  async function createLike(userId: string, entityId: string, entityType: string) {
    const like = new BaseLikeEntity();
    like.userId = userId;
    like.entityId = entityId;
    like.entityType = entityType;
    like.createdAt = new Date();

    return await dataSource.getRepository(BaseLikeEntity).save(like);
  }
});
