import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JwtAuthGuard } from 'src/app/auth/guard/jwt-auth.guard';
import { TEMPLATE_REPOSITORY } from '../domain/constants/template.constants';
import { TemplateRepository } from '../infraestructure/template.mongoose.repository';
import { TemplateMongoSchema, TemplateSchema } from '../infraestructure/template.schema';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: TemplatesService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let templateModel: Model<TemplateMongoSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    templateModel = mongoConnection.model(TemplateMongoSchema.name, TemplateSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        TemplatesService,
        {
          provide: TEMPLATE_REPOSITORY,
          useClass: TemplateRepository,
        },
        {
          provide: getModelToken(TemplateMongoSchema.name),
          useValue: templateModel,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<TemplatesController>(TemplatesController);
    service = module.get<TemplatesService>(TemplatesService);
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
  });
});
