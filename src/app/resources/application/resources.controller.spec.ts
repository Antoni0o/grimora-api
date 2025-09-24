import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import { ResourceMongoSchema, ResourceSchema } from '../infraestructure/resources.schema';
import { RESOURCES_REPOSITORY } from '../domain/constants/resources.constants';
import { ResourcesRepository } from '../infraestructure/resources.mongoose.repository';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceItemRequestDto } from './dto/resource-item-request.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let service: ResourcesService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let resourceModel: Model<ResourceMongoSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    resourceModel = mongoConnection.model(ResourceMongoSchema.name, ResourceSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        ResourcesService,
        {
          provide: RESOURCES_REPOSITORY,
          useClass: ResourcesRepository,
        },
        {
          provide: getModelToken(ResourceMongoSchema.name),
          useValue: resourceModel,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<ResourcesController>(ResourcesController);
    service = module.get<ResourcesService>(ResourcesService);
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const createResourceDto: CreateResourceDto = {
        name: 'Test Resource',
        items: [
          {
            name: 'Test ResourceItem',
            description: 'test',
            props: { prop1: 'test' },
          } as ResourceItemRequestDto,
        ],
      };

      const createdResource = await controller.create(createResourceDto);

      expect(createdResource).toBeDefined();
      expect(createdResource.name).toEqual(createResourceDto.name);
      expect(createdResource.items[0].name).toEqual(createResourceDto.items[0].name);
      expect(createdResource.items[0].description).toEqual(createResourceDto.items[0].description);
      expect(createdResource.items[0].props).toEqual([createResourceDto.items[0].props]);
      expect(createdResource.id).toBeDefined();

      const foundResource = await resourceModel.findById(createdResource.id);
      expect(foundResource).toBeDefined();
      expect(foundResource?.title).toEqual(createResourceDto.name);
    });
  });

  describe('findAll', () => {
    it('should return an array of resources', async () => {
      const resource1 = await createResource('resource 1');
      const resource2 = await createResource('resource 2');

      const resources = await controller.findAll();

      expect(resources).toBeDefined();
      expect(resources.length).toEqual(2);
      expect(resources[0].name).toEqual(resource1.name);
      expect(resources[1].name).toEqual(resource2.name);
    });

    it('should return an empty array if no resources exist', async () => {
      const resources = await controller.findAll();
      expect(resources).toBeDefined();
      expect(resources.length).toEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return a single resource by id', async () => {
      const createdResource = await createResource('resource 1');
      const foundResource = await controller.findOne(createdResource.id);

      expect(foundResource).toBeDefined();
      expect(foundResource.id).toEqual(createdResource.id);
      expect(foundResource.name).toEqual(createdResource.name);
    });

    it('should throw NotFoundException if resource is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an invalid id is provided', async () => {
      const invalidId = 'invalid-mongo-id';
      await expect(controller.findOne(invalidId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const createdResource = await createResource('resource 1');
      const updateResourceDto: UpdateResourceDto = {
        name: 'New Name',
        items: [],
      };

      const updatedResource = await controller.update(createdResource.id, updateResourceDto);

      expect(updatedResource).toBeDefined();
      expect(updatedResource.id).toEqual(createdResource.id);
      expect(updatedResource.name).toEqual(updateResourceDto.name);
      expect(updatedResource.items.length).toBe(0);

      const foundResource = await resourceModel.findById(createdResource.id);
      expect(foundResource?.title).toEqual(updateResourceDto.name);
    });

    it('should throw NotFoundException if resource to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateResourceDto: UpdateResourceDto = { name: 'New Name', items: [] };
      await expect(controller.update(nonExistentId, updateResourceDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing resource', async () => {
      const createdResource = await createResource('resource 1');

      await controller.delete(createdResource.id);

      const foundResource = await resourceModel.findById(createdResource.id);
      expect(foundResource).toBeNull();
    });

    it('should throw NotFoundException if resource to delete is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();

      await expect(controller.delete(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  async function createResource(name: string) {
    return await controller.create(
      new CreateResourceDto(name, [new ResourceItemRequestDto('name', 'description', { prop1: 'test' })]),
    );
  }
});
