import { Test, TestingModule } from '@nestjs/testing';
import { FieldsController } from './fields.controller';
import CreateFieldService from './services/create/create-field.service';
import FieldTypeService from '../field-types/field-type.service';
import CreateFieldMapper from './services/create/create-field.mapper';
import Field, { FieldSchema } from './field.entity';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('FieldsController', () => {
  let controller: FieldsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let fieldModel: Model<Field>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    mongoConnection = (await connect(uri)).connection;
    fieldModel = mongoConnection.model(Field.name, FieldSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldsController],
      providers: [
        CreateFieldService,
        CreateFieldMapper,
        { provide: getModelToken(Field.name), useValue: fieldModel },
        { provide: FieldTypeService, useValue: {} },
      ],
    }).compile();

    controller = module.get<FieldsController>(FieldsController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
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
