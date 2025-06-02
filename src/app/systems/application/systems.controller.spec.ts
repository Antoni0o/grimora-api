import { Test, TestingModule } from '@nestjs/testing';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';
import { SystemRepository } from '../infraestructure/persistence/system.mongoose.repository';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { getModelToken } from '@nestjs/mongoose';
import { SystemMongoSchema, SystemSchema } from '../infraestructure/persistence/system.schema';
import { connect, Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('SystemsController', () => {
  let controller: SystemsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let systemModel: Model<SystemMongoSchema>;

  beforeEach(async () => {
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
        { provide: getModelToken(SystemMongoSchema.name), useValue: systemModel },
      ],
    }).compile();

    controller = module.get<SystemsController>(SystemsController);
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
