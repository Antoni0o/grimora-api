/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemsService } from './systems.service';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import { System } from '../domain/entities/system.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateSystemDto } from './dto/update-system.dto';
import { v4 as uuid } from 'uuid';
import { Types } from 'mongoose';
import { LikesService } from '../../likes/application/likes.service';

describe('SystemsService', () => {
  let service: SystemsService;
  let repository: ISystemRepository;
  let likesService: jest.Mocked<LikesService>;

  const resourceIds = [];
  const templateIds = [new Types.ObjectId().toHexString()];
  const creatorId = 'creatorUUID';
  const title = 'new rpg system';
  const systemId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    const mockLikesService = {
      deleteAllLikesForEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemsService,
        {
          provide: SYSTEM_REPOSITORY,
          useValue: <ISystemRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            findByTitle: jest.fn(),
            findByCreatorId: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
      ],
    }).compile();

    service = module.get<SystemsService>(SystemsService);
    repository = module.get<ISystemRepository>(SYSTEM_REPOSITORY);
    likesService = module.get(LikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a system', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateIds, resourceIds, creatorId);
    const createdSystem = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'create').mockResolvedValue(createdSystem);

    // act
    const response = await service.create(request);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title,
        creatorId,
        templates: expect.arrayContaining([expect.objectContaining({ id: templateIds[0] })]),
        resources: expect.arrayContaining([]),
      }),
    );
    expect(response).toStrictEqual(expect.objectContaining({ id: createdSystem.id }));
  });

  it('should not create a system when repository fails', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateIds, resourceIds, creatorId);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title,
        creatorId,
        templates: expect.arrayContaining([expect.objectContaining({ id: templateIds[0] })]),
        resources: expect.arrayContaining([]),
      }),
    );
  });

  it('should find all systems', async () => {
    // arrange
    const system = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findAll').mockResolvedValue([system]);

    // act
    const response = await service.findAll();

    // assert
    expect(response.length).toBe(1);
    expect(response.at(0)?.id).toBe(system.id);
  });

  it('should not find all systems when repository fails', async () => {
    // arrange
    jest.spyOn(repository, 'findAll').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should find systems by title', async () => {
    // arrange
    const title = 'rpg';
    const system = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findByTitle').mockResolvedValue([system]);

    // act
    const response = await service.findByTitle(title);

    // assert
    expect(response.length).toBe(1);
    expect(response.at(0)?.id).toBe(system.id);
    expect(repository.findByTitle).toHaveBeenCalledWith(title);
  });

  it('should not find systems by title when repository fails', async () => {
    // arrange
    const title = 'rpg';
    jest.spyOn(repository, 'findByTitle').mockResolvedValue(null);

    // act
    await expect(service.findByTitle(title)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findByTitle).toHaveBeenCalledWith(title);
  });

  it('should find systems by creator id', async () => {
    // arrange
    const system = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findByCreatorId').mockResolvedValue([system]);

    // act
    const response = await service.findByCreatorId(creatorId);

    // assert
    expect(response.length).toBe(1);
    expect(response.at(0)?.id).toBe(system.id);
    expect(repository.findByCreatorId).toHaveBeenCalledWith(creatorId);
  });

  it('should not find systems by creator id when repository fails', async () => {
    // arrange
    jest.spyOn(repository, 'findByCreatorId').mockResolvedValue(null);

    // act
    await expect(service.findByCreatorId(creatorId)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findByCreatorId).toHaveBeenCalledWith(creatorId);
  });

  it('should find system by id', async () => {
    // arrange
    const system = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(system);

    // act
    const response = await service.findOne(system.id);

    // assert
    expect(response.id).toBe(system.id);
  });

  it('should not find system by id when repository returns null', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should update a system', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.templateIds = [uuid()];
    request.resourceIds = [uuid()];
    request.requesterId = creatorId;

    const systemToUpdate = new System(systemId, title, creatorId, [], []);
    const updatedSystem = new System(systemId, request.title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(updatedSystem);

    // act
    const response = await service.update(systemId, request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(updatedSystem.id);
    expect(repository.update).toHaveBeenCalledWith(
      updatedSystem.id,
      expect.objectContaining({
        title: request.title,
        templates: expect.arrayContaining([expect.objectContaining({ id: request.templateIds[0] })]),
        resources: expect.arrayContaining([expect.objectContaining({ id: request.resourceIds[0] })]),
      }),
    );
    expect(response).toStrictEqual(expect.objectContaining({ id: updatedSystem.id }));
  });

  it('should not update when system is not found', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.templateIds = [uuid()];
    request.resourceIds = [uuid()];

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update system when requester is not creator', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.templateIds = [uuid()];
    request.resourceIds = [uuid()];
    request.requesterId = uuid();
    const systemToUpdate = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(systemId, request)).rejects.toThrow(BadRequestException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(systemId);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update a system when repository fails', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.templateIds = [uuid()];
    request.resourceIds = [uuid()];
    request.requesterId = creatorId;
    const systemToUpdate = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(systemId, request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(systemId);
    expect(repository.update).toHaveBeenCalledWith(
      systemId,
      expect.objectContaining({
        title: request.title,
        templates: expect.arrayContaining([expect.objectContaining({ id: request.templateIds[0] })]),
        resources: expect.arrayContaining([expect.objectContaining({ id: request.resourceIds[0] })]),
      }),
    );
  });

  it('should delete a system', async () => {
    // arrange
    const systemToDelete = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(true);
    likesService.deleteAllLikesForEntity.mockResolvedValue(undefined);

    // act
    const response = await service.delete(systemId, creatorId);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(systemId);
    expect(likesService.deleteAllLikesForEntity).toHaveBeenCalledWith('system', systemId);
    expect(repository.delete).toHaveBeenCalledWith(systemId);
    expect(response).toBe(true);
  });

  it('should not delete when system is not found', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.delete(systemId, creatorId)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete a system when requester is not creator', async () => {
    // arrange
    const systemToDelete = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToDelete);

    // act
    await expect(service.delete(systemId, uuid())).rejects.toThrow(BadRequestException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete system when repository fails', async () => {
    // arrange
    const systemToDelete = new System(systemId, title, creatorId, [], []);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);
    likesService.deleteAllLikesForEntity.mockResolvedValue(undefined);

    // act
    await expect(service.delete(systemId, creatorId)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(systemId);
    expect(likesService.deleteAllLikesForEntity).toHaveBeenCalledWith('system', systemId);
    expect(repository.delete).toHaveBeenCalledWith(systemId);
  });
});
