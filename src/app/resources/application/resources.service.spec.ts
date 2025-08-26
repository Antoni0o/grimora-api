import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { Types } from 'mongoose';
import { Resource } from '../domain/entities/resource.entity';
import { ResourceItem } from '../domain/entities/resource-item.entity';
import { IResourcesRepository } from '../domain/repositories/resources.repository';
import { RESOURCES_REPOSITORY } from '../domain/constants/resources.constants';
import { ResourceItemRequestDto } from './dto/resource-item-request.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { ResourceItemResponseDto } from './dto/resource-item-response.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateResourceDto } from './dto/update-resource.dto';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let repository: IResourcesRepository;

  const resourceId = new Types.ObjectId();
  const resourceName = 'Spells';
  const resourceItemName = 'Fire ball';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: RESOURCES_REPOSITORY,
          useValue: <IResourcesRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    repository = module.get<IResourcesRepository>(RESOURCES_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a resource', async () => {
    // arrange
    const resourceItemDto = new ResourceItemRequestDto(resourceItemName, 'description', { level: 5, damage: '1d10' });
    const request = new CreateResourceDto(resourceName, [resourceItemDto]);

    const resource = createResource(resourceId, resourceName);

    jest.spyOn(repository, 'create').mockResolvedValue(resource);

    // act
    const response = await service.create(request);

    // assert
    expect(response).toStrictEqual(
      new ResourceResponseDto(resource.id, request.name, [
        new ResourceItemResponseDto(
          resource.items[0].id,
          resourceItemDto.name,
          resourceItemDto.description,
          resourceItemDto.props,
        ),
      ]),
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: request.name,
        items: expect.arrayContaining([
          expect.objectContaining({
            name: resourceItemDto.name,
            description: resourceItemDto.description,
            props: resourceItemDto.props,
          }),
        ]),
      }),
    );
  });

  it('should not create a resource when repository fails', async () => {
    // arrange
    const resourceItemDto = new ResourceItemRequestDto(resourceItemName, 'description', { level: 5, damage: '1d10' });
    const request = new CreateResourceDto(resourceName, [resourceItemDto]);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: request.name,
        items: expect.arrayContaining([
          expect.objectContaining({
            name: resourceItemDto.name,
            description: resourceItemDto.description,
            props: resourceItemDto.props,
          }),
        ]),
      }),
    );
  });

  it('should find all resources', async () => {
    // arrange
    const resource = createResource(resourceId, resourceName);

    jest.spyOn(repository, 'findAll').mockResolvedValue([resource]);

    // act
    const response = await service.findAll();

    // assert
    expect(response).toEqual([
      new ResourceResponseDto(resourceId.toHexString(), resourceName, [
        new ResourceItemResponseDto(
          resource.items[0].id,
          resource.items[0].name,
          resource.items[0].description,
          resource.items[0].props,
        ),
      ]),
    ]);

    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should not find all resources when repository fails', async () => {
    // arrange
    jest.spyOn(repository, 'findAll').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find resource by id', async () => {
    // arrange
    const resource = createResource(resourceId, resourceName);

    jest.spyOn(repository, 'findById').mockResolvedValue(resource);

    // act
    const response = await service.findOne(resourceId.toHexString());

    // assert
    expect(response.id).toBe(resource.id);
  });

  it('should not find resource by id when repository returns null', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should update a resource adding a field', async () => {
    // arrange
    const resourceToUpdate = createResource(resourceId, resourceName);

    const request = new UpdateResourceDto();
    request.name = 'Weapons';
    request.items = [
      new ResourceItemRequestDto('Long Sword', 'description', { damage: '1d10' }),
      new ResourceItemRequestDto(resourceItemName, 'description', { level: 1 }),
    ];

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(resourceToUpdate);

    // act
    const response = await service.update(resourceId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      resourceToUpdate.id,
      expect.objectContaining({
        id: resourceToUpdate.id,
        name: request.name,
        fields: expect.arrayContaining([
          expect.objectContaining({
            id: '',
            name: request.items[0].name,
            description: request.items[0].description,
            props: request.items[0].props,
          }),
          expect.objectContaining({
            id: '',
            name: request.items[1].name,
            description: request.items[0].description,
            props: request.items[0].props,
          }),
        ]),
      }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: resourceToUpdate.id }));
  });

  it('should update a resource removing a field', async () => {
    // arrange
    const resourceToUpdate = createResource(resourceId, resourceName);

    const request = new UpdateResourceDto();
    request.name = 'New Name';
    request.items = [];

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(resourceToUpdate);

    // act
    const response = await service.update(resourceId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      resourceToUpdate.id,
      expect.objectContaining({ name: request.name, items: request.items }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: resourceToUpdate.id }));
  });

  it('should update a resource editing a field', async () => {
    // arrange
    const resourceToUpdate = createResource(resourceId, resourceName);

    const request = new UpdateResourceDto();
    request.name = 'New Name';
    request.items = [new ResourceItemRequestDto('New resource', 'new resource description', { resourceProp: 'test' })];

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(resourceToUpdate);

    // act
    const response = await service.update(resourceId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      resourceToUpdate.id,
      expect.objectContaining({ name: request.name, items: request.items }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: resourceToUpdate.id }));
  });

  it('should not update when resource is not found', async () => {
    // arrange
    const request = new UpdateResourceDto();
    request.name = 'new name';
    request.items = [
      new ResourceItemRequestDto('New resource', 'new resource description', { resourceProp: 'test' }),
      new ResourceItemRequestDto('New resource 2', 'new resource description 2', { resourceProp: 123231 }),
    ];

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update resource when repository fails', async () => {
    // arrange
    const resourceToUpdate = createResource(resourceId, resourceName);

    const request = new UpdateResourceDto();
    request.name = 'new name';
    request.items = [];

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(resourceId.toHexString(), request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceId.toHexString());
    expect(repository.update).toHaveBeenCalledWith(
      resourceToUpdate.id,
      expect.objectContaining({ name: request.name, items: request.items }),
    );
  });

  it('should delete a resource', async () => {
    // arrange
    const resourceToDelete = createResource(resourceId, resourceName);

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(true);

    // act
    const response = await service.delete(resourceId.toHexString());

    // assert
    expect(response).toBeTruthy();
    expect(repository.findById).toHaveBeenCalledWith(resourceId.toHexString());
    expect(repository.delete).toHaveBeenCalledWith(resourceId.toHexString());
  });

  it('should not delete when resource is not found', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete(resourceId.toHexString())).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceId.toHexString());
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete resource when repository fails', async () => {
    // arrange
    const resourceToDelete = createResource(resourceId, resourceName);

    jest.spyOn(repository, 'findById').mockResolvedValue(resourceToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete(resourceId.toHexString())).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(resourceId.toHexString());
    expect(repository.delete).toHaveBeenCalledWith(resourceId.toHexString());
  });
});

function createResource(resourceId: Types.ObjectId, resourceName: string) {
  return new Resource(resourceId.toHexString(), resourceName, [
    new ResourceItem(new Types.ObjectId().toHexString(), 'test resource item', 'description', {
      test: 1,
      test2: 'string value',
    }),
  ]);
}
