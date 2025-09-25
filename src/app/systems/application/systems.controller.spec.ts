import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { SystemRepository } from '../infraestructure/system.mongoose.repository';
import { SystemMongoSchema, SystemSchema } from '../infraestructure/system.schema';
import { TemplateMongoSchema, TemplateSchema } from '../../templates/infraestructure/template.schema';
import { ResourceMongoSchema, ResourceSchema } from '../../resources/infraestructure/resources.schema';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { LikesService } from 'src/app/likes/application/likes.service';
import { UserSession } from 'src/lib/auth';

describe('SystemsController', () => {
  let controller: SystemsController;
  let service: SystemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let systemModel: Model<SystemMongoSchema>;
  let templateModel: Model<TemplateMongoSchema>;
  let resourceModel: Model<ResourceMongoSchema>;

  const userId = uuid();
  const userSession = <UserSession>{
    user: {
      id: userId,
    },
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    systemModel = mongoConnection.model(SystemMongoSchema.name, SystemSchema);
    templateModel = mongoConnection.model(TemplateMongoSchema.name, TemplateSchema);
    resourceModel = mongoConnection.model(ResourceMongoSchema.name, ResourceSchema);

    const mockLikesService = {
      deleteAllLikesForEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemsController],
      providers: [
        SystemsService,
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
        {
          provide: SYSTEM_REPOSITORY,
          useClass: SystemRepository,
        },
        {
          provide: getModelToken(SystemMongoSchema.name),
          useValue: systemModel,
        },
        {
          provide: getModelToken(TemplateMongoSchema.name),
          useValue: templateModel,
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
        templateIds: [new Types.ObjectId().toHexString()],
        resourceIds: [new Types.ObjectId().toHexString()],
        creatorId: uuid(),
      };
      const createdSystem = await controller.create(createSystemDto, userSession);

      expect(createdSystem).toBeDefined();
      expect(createdSystem.title).toEqual(createSystemDto.title);
      expect(createdSystem.templateIds).toEqual([new Types.ObjectId(createSystemDto.templateIds[0]).toHexString()]);
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

  describe('findByTitle', () => {
    it('should return systems that match the title pattern', async () => {
      await createSystem('My RPG System');
      await createSystem('Another RPG Game');
      await createSystem('Card Game System');

      const systems = await controller.findByTitle('RPG');

      expect(systems).toBeDefined();
      expect(systems.length).toEqual(2);
      expect(systems.every(s => s.title.includes('RPG'))).toBeTruthy();
    });

    it('should return empty array if no systems match the title', async () => {
      await createSystem('Card Game System');

      const systems = await controller.findByTitle('RPG');

      expect(systems).toBeDefined();
      expect(systems.length).toEqual(0);
    });

    it('should be case insensitive', async () => {
      await createSystem('My RPG System');

      const systems = await controller.findByTitle('rpg');

      expect(systems).toBeDefined();
      expect(systems.length).toEqual(1);
      expect(systems[0].title).toEqual('My RPG System');
    });
  });

  describe('findByCreatorId', () => {
    it('should return systems created by the current user', async () => {
      const userId1 = uuid();
      const userId2 = uuid();

      await createSystem('System 1', userId1);
      await createSystem('System 2', userId1);
      await createSystem('System 3', userId2);

      userSession.user.id = userId1;
      const systems = await controller.findByCreatorId(userSession);

      expect(systems).toBeDefined();
      expect(systems.length).toEqual(2);
      expect(systems.every(s => s.creatorId === userId1)).toBeTruthy();
    });

    it('should return empty array if user has no systems', async () => {
      await createSystem('System 1', uuid());

      userSession.user.id = uuid();
      const systems = await controller.findByCreatorId(userSession);

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
        templateIds: [new Types.ObjectId().toHexString()],
        resourceIds: [new Types.ObjectId().toHexString()],
        requesterId: userId,
      };

      const updatedSystem = await controller.update(createdSystem.id, updateSystemDto);

      expect(updatedSystem).toBeDefined();
      expect(updatedSystem.id).toEqual(createdSystem.id);
      expect(updatedSystem.title).toEqual(updateSystemDto.title);
      expect(updatedSystem.resourceIds).toBeDefined();

      const foundSystem = await systemModel.findById(createdSystem.id);
      expect(foundSystem?.title).toEqual(updateSystemDto.title);
    });

    it('should throw NotFoundException if system to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateSystemDto: UpdateSystemDto = {
        title: 'New Name',
        templateIds: [],
        resourceIds: [],
      };
      await expect(controller.update(nonExistentId, updateSystemDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing system', async () => {
      const createdSystem = await createSystem('system 1', userId);

      await controller.delete(createdSystem.id, userSession);

      const foundSystem = await systemModel.findById(createdSystem.id);
      expect(foundSystem).toBeNull();
    });

    it('should throw NotFoundException if system to remove is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();

      await expect(controller.delete(nonExistentId, userSession)).rejects.toThrow(NotFoundException);
    });
  });

  async function createSystem(title: string, userId?: string) {
    userSession.user.id = userId ?? uuid();
    return await controller.create(
      { title, creatorId: '', templateIds: [new Types.ObjectId().toHexString()], resourceIds: [] },
      userSession,
    );
  }
});
