import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { JwtAuthGuard } from 'src/app/auth/guard/jwt-auth.guard';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { SystemRepository } from '../infraestructure/system.mongoose.repository';
import { SystemMongoSchema, SystemSchema } from '../infraestructure/system.schema';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';

describe('SystemsController', () => {
  let controller: SystemsController;
  let service: SystemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let systemModel: Model<SystemMongoSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    systemModel = mongoConnection.model(SystemMongoSchema.name, SystemSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemsController],
      providers: [
        SystemsService,
        {
          provide: SYSTEM_REPOSITORY,
          useClass: SystemRepository,
        },
        {
          provide: getModelToken(SystemMongoSchema.name),
          useValue: systemModel,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<SystemsController>(SystemsController);
    service = module.get<SystemsService>(SystemsService);
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
    it('should create a new system', async () => {
      const createSystemDto: CreateSystemDto = {
        title: 'Test System',
        templateId: new Types.ObjectId().toHexString(),
        resourceIds: [new Types.ObjectId().toHexString()],
        creatorId: uuid(),
      };
      const userId = uuid();
      const createdSystem = await controller.create(createSystemDto, userId);

      expect(createdSystem).toBeDefined();
      expect(createdSystem.title).toEqual(createSystemDto.title);
      expect(createdSystem.templateId).toEqual(createSystemDto.templateId);
      expect(createdSystem.id).toBeDefined();

      const foundSystem = await systemModel.findById(createdSystem.id);
      expect(foundSystem).toBeDefined();
      expect(foundSystem?.title).toEqual(createSystemDto.title);
    });
  });

  describe('findAll', () => {
    it('should return an array of systems', async () => {
      const system1 = await createSystem('system 1');
      const system2 = await createSystem('system 2');

      const systems = await controller.findAll();

      expect(systems).toBeDefined();
      expect(systems.length).toEqual(2);
      expect(systems[0].title).toEqual(system1.title);
      expect(systems[1].title).toEqual(system2.title);
    });

    it('should return an empty array if no systems exist', async () => {
      const systems = await controller.findAll();
      expect(systems).toBeDefined();
      expect(systems.length).toEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return a single system by id', async () => {
      const createdSystem = await createSystem('system 1');
      const foundSystem = await controller.findOne(createdSystem.id);

      expect(foundSystem).toBeDefined();
      expect(foundSystem.id).toEqual(createdSystem.id);
      expect(foundSystem.title).toEqual(createdSystem.title);
    });

    it('should throw NotFoundException if system is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an invalid id is provided', async () => {
      const invalidId = 'invalid-mongo-id';
      await expect(controller.findOne(invalidId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing system', async () => {
      const userId = uuid();
      const createdSystem = await createSystem('system 1', userId);
      const updateSystemDto: UpdateSystemDto = {
        title: 'New Name',
        resourceIds: [new Types.ObjectId().toHexString()],
        requesterId: userId,
      };

      const updatedSystem = await controller.update(createdSystem.id, updateSystemDto);

      expect(updatedSystem).toBeDefined();
      expect(updatedSystem.id).toEqual(createdSystem.id);
      expect(updatedSystem.title).toEqual(updateSystemDto.title);
      expect(updatedSystem.resourceIds).toEqual(updateSystemDto.resourceIds);

      const foundSystem = await systemModel.findById(createdSystem.id);
      expect(foundSystem?.title).toEqual(updateSystemDto.title);
    });

    it('should throw NotFoundException if system to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateSystemDto: UpdateSystemDto = { title: 'New Name', resourceIds: [] };
      await expect(controller.update(nonExistentId, updateSystemDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing system', async () => {
      const userId = uuid();
      const createdSystem = await createSystem('system 1', userId);

      await controller.delete(createdSystem.id, userId);

      const foundSystem = await systemModel.findById(createdSystem.id);
      expect(foundSystem).toBeNull();
    });

    it('should throw NotFoundException if system to remove is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const userId = uuid();

      await expect(controller.delete(nonExistentId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  async function createSystem(title: string, userId?: string) {
    return await controller.create(
      { title, creatorId: '', templateId: new Types.ObjectId().toHexString(), resourceIds: [] },
      userId ?? uuid(),
    );
  }
});
