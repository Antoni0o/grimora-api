import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';

import { TEMPLATES_REPOSITORY } from '../domain/constants/template.constants';
import { TemplatesRepository } from '../infraestructure/template.mongoose.repository';
import { TemplateMongoSchema, TemplateSchema } from '../infraestructure/template.schema';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { FieldRequestDto } from './dto/field-request.dto';
import { FieldType } from '../domain/enums/field-type.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

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
          provide: TEMPLATES_REPOSITORY,
          useClass: TemplatesRepository,
        },
        {
          provide: getModelToken(TemplateMongoSchema.name),
          useValue: templateModel,
        },
      ],
    })
      .overrideGuard(AuthGuard)
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
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      const createTemplateDto: CreateTemplateDto = {
        title: 'Test Template',
        fields: [
          {
            title: 'Test Field',
            type: FieldType.TEXT,
          } as FieldRequestDto,
        ],
      };

      const createdTemplate = await controller.create(createTemplateDto);

      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.title).toEqual(createTemplateDto.title);
      expect(createdTemplate.fields[0].title).toEqual(createTemplateDto.fields[0].title);
      expect(createdTemplate.fields[0].type).toEqual(FieldType.TEXT);
      expect(createdTemplate.id).toBeDefined();

      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate).toBeDefined();
      expect(foundTemplate?.title).toEqual(createTemplateDto.title);
    });
  });

  describe('findAll', () => {
    it('should return an array of templates', async () => {
      const template1 = await createTemplate('template 1');
      const template2 = await createTemplate('template 2');

      const templates = await controller.findAll();

      expect(templates).toBeDefined();
      expect(templates.length).toEqual(2);
      expect(templates[0].title).toEqual(template1.title);
      expect(templates[1].title).toEqual(template2.title);
    });

    it('should return an empty array if no templates exist', async () => {
      const templates = await controller.findAll();
      expect(templates).toBeDefined();
      expect(templates.length).toEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return a single template by id', async () => {
      const createdTemplate = await createTemplate('template 1');
      const foundTemplate = await controller.findOne(createdTemplate.id);

      expect(foundTemplate).toBeDefined();
      expect(foundTemplate.id).toEqual(createdTemplate.id);
      expect(foundTemplate.title).toEqual(createdTemplate.title);
    });

    it('should throw NotFoundException if template is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an invalid id is provided', async () => {
      const invalidId = 'invalid-mongo-id';
      await expect(controller.findOne(invalidId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing template', async () => {
      const createdTemplate = await createTemplate('template 1');
      const updateTemplateDto: UpdateTemplateDto = {
        title: 'New Name',
        fields: [],
      };

      const updatedTemplate = await controller.update(createdTemplate.id, updateTemplateDto);

      expect(updatedTemplate).toBeDefined();
      expect(updatedTemplate.id).toEqual(createdTemplate.id);
      expect(updatedTemplate.title).toEqual(updateTemplateDto.title);
      expect(updatedTemplate.fields.length).toBe(0);

      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate?.title).toEqual(updateTemplateDto.title);
    });

    it('should throw NotFoundException if template to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateTemplateDto: UpdateTemplateDto = { title: 'New Name', fields: [] };
      await expect(controller.update(nonExistentId, updateTemplateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing template', async () => {
      const createdTemplate = await createTemplate('template 1');

      await controller.delete(createdTemplate.id);

      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate).toBeNull();
    });

    it('should throw NotFoundException if template to delete is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();

      await expect(controller.delete(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  async function createTemplate(title: string) {
    return await controller.create(new CreateTemplateDto(title, [new FieldRequestDto('title', FieldType.TEXT)]));
  }
});
