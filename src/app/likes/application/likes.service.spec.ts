import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { LIKE_REPOSITORY } from '../domain/constants/like.constants';
import { LikeRepository } from '../domain/repositories/like.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Like } from '../domain/entities/like.entity';

describe('LikesService', () => {
  let service: LikesService;
  let repository: jest.Mocked<LikeRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      findByUserAndEntity: jest.fn(),
      countByEntity: jest.fn(),
      findAllByUserAndEntityType: jest.fn(),
      deleteAllByEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: LIKE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    repository = module.get(LIKE_REPOSITORY);
  });

  describe('addLike', () => {
    it('should create a new like when user has not liked the entity', async () => {
      repository.findByUserAndEntity.mockResolvedValue(null);
      repository.create.mockResolvedValue(new Like('user1', 'entity1', 'systems'));

      await service.addLike('user1', 'entity1', 'systems');

      expect(repository.findByUserAndEntity).toHaveBeenCalledWith('user1', 'entity1', 'systems');
      expect(repository.create).toHaveBeenCalledWith(expect.any(Like));
    });

    it('should throw ConflictException when user has already liked the entity', async () => {
      repository.findByUserAndEntity.mockResolvedValue(new Like('user1', 'entity1', 'systems'));

      await expect(service.addLike('user1', 'entity1', 'systems')).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteLike', () => {
    it('should delete like when it exists', async () => {
      repository.findByUserAndEntity.mockResolvedValue(new Like('user1', 'entity1', 'systems'));

      await service.deleteLike('user1', 'entity1', 'systems');

      expect(repository.delete).toHaveBeenCalledWith('user1', 'entity1', 'systems');
    });

    it('should throw NotFoundException when like does not exist', async () => {
      repository.findByUserAndEntity.mockResolvedValue(null);

      await expect(service.deleteLike('user1', 'entity1', 'systems')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLikeCount', () => {
    it('should return like count for entity', async () => {
      repository.countByEntity.mockResolvedValue(5);

      const result = await service.getLikeCount('entity1', 'systems');

      expect(result.count).toBe(5);
      expect(repository.countByEntity).toHaveBeenCalledWith('entity1', 'systems');
    });
  });

  describe('getAllUserLikesForEntityType', () => {
    it('should return array of entity IDs that user has liked', async () => {
      const mockLikes = [
        new Like('user1', 'system1', 'systems'),
        new Like('user1', 'system2', 'systems'),
        new Like('user1', 'system3', 'systems'),
      ];
      repository.findAllByUserAndEntityType.mockResolvedValue(mockLikes);

      const result = await service.getAllUserLikesForEntityType('user1', 'systems');

      expect(result).toEqual(['system1', 'system2', 'system3']);
      expect(repository.findAllByUserAndEntityType).toHaveBeenCalledWith('user1', 'systems');
    });

    it('should return empty array when user has not liked any entities of the type', async () => {
      repository.findAllByUserAndEntityType.mockResolvedValue([]);

      const result = await service.getAllUserLikesForEntityType('user1', 'systems');

      expect(result).toEqual([]);
      expect(repository.findAllByUserAndEntityType).toHaveBeenCalledWith('user1', 'systems');
    });
  });

  describe('deleteAllLikesForEntity', () => {
    it('should call repository deleteAllByEntity with correct parameters', async () => {
      await service.deleteAllLikesForEntity('system', 'system123');

      expect(repository.deleteAllByEntity).toHaveBeenCalledWith('system', 'system123');
    });

    it('should handle deletion without errors', async () => {
      repository.deleteAllByEntity.mockResolvedValue(undefined);

      await expect(service.deleteAllLikesForEntity('system', 'system123')).resolves.toBeUndefined();
    });
  });
});
