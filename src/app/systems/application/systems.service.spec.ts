/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemsService } from './systems.service';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import { System } from '../domain/entities/system.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateSystemDto } from './dto/update-system.dto';
import { v4 as uuid } from 'uuid';

describe('SystemsService', () => {
  let service: SystemsService;
  let repository: ISystemRepository;

  const resourceIds = [];
  const templateId = 'templateUUID';
  const creatorId = 'creatorUUID';
  const title = 'new rpg system';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemsService,
        {
          provide: SYSTEM_REPOSITORY,
          useValue: <ISystemRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SystemsService>(SystemsService);
    repository = module.get<ISystemRepository>(SYSTEM_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a system', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateId, resourceIds, creatorId);
    const createdSystem = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'create').mockResolvedValue(createdSystem);

    // act
    const response = await service.create(request);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title, templateId, resourceIds, creatorId }),
    );
    expect(response).toStrictEqual(expect.objectContaining({ id: createdSystem.id }));
  });

  it('should not create a system when repository fails', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateId, resourceIds, creatorId);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title, templateId, resourceIds, creatorId }),
    );
  });

  it('should find all systems', async () => {
    // arrange
    const system = new System('systemId', title, creatorId, templateId, resourceIds);

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

  it('should find system by id', async () => {
    // arrange
    const system = new System('systemId', title, creatorId, templateId, resourceIds);

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
    request.resourceIds = [uuid()];

    const systemToUpdate = new System('systemId', title, creatorId, templateId, resourceIds);
    const updatedSystem = new System('systemId', request.title, creatorId, templateId, request.resourceIds);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(updatedSystem);

    // act
    const response = await service.update('systemId', request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(updatedSystem.id);
    expect(repository.update).toHaveBeenCalledWith(
      updatedSystem.id,
      expect.objectContaining({ title: request.title, resourceIds: request.resourceIds }),
    );
    expect(response).toStrictEqual(expect.objectContaining({ id: updatedSystem.id }));
  });

  it('should not update when system is not found', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.resourceIds = [uuid()];

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update a system when repository fails', async () => {
    // arrange
    const request = new UpdateSystemDto();
    request.title = 'new title';
    request.resourceIds = [uuid()];
    const systemToUpdate = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).toHaveBeenCalledWith(
      'unexistent-id',
      expect.objectContaining({ title: request.title, resourceIds: request.resourceIds }),
    );
  });

  it('should delete a system', async () => {
    // arrange
    const systemToDelete = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(true);

    // act
    const response = await service.delete('systemId');

    // assert
    expect(repository.findById).toHaveBeenCalledWith('systemId');
    expect(repository.delete).toHaveBeenCalledWith('systemId');
    expect(response).toBe(true);
  });

  it('should not delete when system is not found', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.delete('systemId')).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete system when repository fails', async () => {
    // arrange
    const systemToDelete = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'findById').mockResolvedValue(systemToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete('systemId')).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('systemId');
    expect(repository.delete).toHaveBeenCalledWith('systemId');
  });
});
