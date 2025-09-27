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
import { PositionDto } from './dto/position.dto';

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
    it('should create a new template with proper field positioning', async () => {
      const createTemplateDto: CreateTemplateDto = {
        title: 'Test Template',
        fields: [
          {
            title: 'Test Field',
            type: FieldType.TEXT,
            positions: [new PositionDto(1, 1), new PositionDto(1, 2)],
          } as FieldRequestDto,
        ],
      };

      const createdTemplate = await controller.create(createTemplateDto);

      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.title).toEqual(createTemplateDto.title);
      expect(createdTemplate.fields[0].title).toEqual(createTemplateDto.fields[0].title);
      expect(createdTemplate.fields[0].type).toEqual(FieldType.TEXT);
      expect(createdTemplate.id).toBeDefined();

      // Verificar se foi salvo corretamente no MongoDB incluindo usedPositions
      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate).toBeDefined();
      expect(foundTemplate?.title).toEqual(createTemplateDto.title);
      expect(foundTemplate?.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 1, col: 2 }),
        ]),
      );
      expect(foundTemplate?.fields).toHaveLength(1);
      expect(foundTemplate?.fields?.[0].positions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 1, col: 2 }),
        ]),
      );
    });

    it('should create template with multiple fields and proper grid positioning', async () => {
      const createTemplateDto: CreateTemplateDto = {
        title: 'Multi Field Template',
        fields: [
          {
            title: 'Field 1',
            type: FieldType.TEXT,
            positions: [new PositionDto(1, 1)],
          } as FieldRequestDto,
          {
            title: 'Field 2',
            type: FieldType.NUMBER,
            positions: [new PositionDto(2, 2), new PositionDto(2, 3)],
          } as FieldRequestDto,
        ],
      };

      const createdTemplate = await controller.create(createTemplateDto);

      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.fields).toHaveLength(2);

      // Verificar integração completa no MongoDB
      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate?.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 2, col: 2 }),
          expect.objectContaining({ row: 2, col: 3 }),
        ]),
      );
      expect(foundTemplate?.fields).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return an array of templates with proper field data', async () => {
      const template1 = await createTemplate('template 1');
      const template2 = await createTemplate('template 2');

      const templates = await controller.findAll();

      expect(templates).toBeDefined();
      expect(templates.length).toEqual(2);
      expect(templates[0].title).toEqual(template1.title);
      expect(templates[1].title).toEqual(template2.title);

      // Verificar que os campos foram carregados corretamente
      expect(templates[0].fields).toHaveLength(1);
      expect(templates[1].fields).toHaveLength(1);
      expect(templates[0].fields[0].type).toEqual(FieldType.TEXT);
      expect(templates[1].fields[0].type).toEqual(FieldType.TEXT);
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
    it('should update an existing template and persist grid changes', async () => {
      const createdTemplate = await createTemplate('template 1');
      const updateTemplateDto: UpdateTemplateDto = {
        title: 'Updated Template',
        fields: [
          {
            title: 'Updated Field',
            type: FieldType.NUMBER,
            positions: [new PositionDto(3, 2), new PositionDto(3, 3), new PositionDto(4, 4)],
          } as FieldRequestDto,
        ],
      };

      const updatedTemplate = await controller.update(createdTemplate.id, updateTemplateDto);

      expect(updatedTemplate).toBeDefined();
      expect(updatedTemplate.id).toEqual(createdTemplate.id);
      expect(updatedTemplate.title).toEqual(updateTemplateDto.title);

      // Verificar integração completa - dados persistidos no MongoDB
      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate?.title).toEqual(updateTemplateDto.title);
      expect(foundTemplate?.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }), // Campo original
          expect.objectContaining({ row: 3, col: 2 }), // Campo atualizado
          expect.objectContaining({ row: 3, col: 3 }), // Campo atualizado
          expect.objectContaining({ row: 4, col: 4 }), // Campo atualizado
        ]),
      );
      expect(foundTemplate?.fields).toHaveLength(2); // Campo original + campo atualizado

      // Verificar que pelo menos um campo tem os dados atualizados
      const updatedField = foundTemplate?.fields?.find(f => f.title === 'Updated Field');
      expect(updatedField).toBeDefined();
      expect(updatedField?.type).toEqual(FieldType.NUMBER);
    });

    it('should handle field updates preserving existing positioning', async () => {
      // Criar template com field inicial
      const createdTemplate = await createTemplate('Initial Template');

      // Update adicionando novo field
      const updateTemplateDto: UpdateTemplateDto = {
        title: 'Updated Template',
        fields: [
          {
            title: 'New Field',
            type: FieldType.SELECT,
            positions: [new PositionDto(5, 5)],
          } as FieldRequestDto,
        ],
      };

      const updatedTemplate = await controller.update(createdTemplate.id, updateTemplateDto);

      // Verificar que o template foi atualizado corretamente
      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate?.fields).toHaveLength(2); // Campo original + novo campo
      expect(foundTemplate?.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }), // Campo original
          expect.objectContaining({ row: 5, col: 5 }), // Novo campo
        ]),
      );
    });

    it('should throw NotFoundException if template to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateTemplateDto: UpdateTemplateDto = { title: 'New Name', fields: [] };
      await expect(controller.update(nonExistentId, updateTemplateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing template and remove from database', async () => {
      const createdTemplate = await createTemplate('template 1');

      // Verificar que existe no banco antes de deletar
      const templateBeforeDelete = await templateModel.findById(createdTemplate.id);
      expect(templateBeforeDelete).not.toBeNull();

      await controller.delete(createdTemplate.id);

      // Verificar que foi completamente removido do MongoDB
      const foundTemplate = await templateModel.findById(createdTemplate.id);
      expect(foundTemplate).toBeNull();
    });

    it('should throw NotFoundException if template to delete is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();

      await expect(controller.delete(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid ObjectId gracefully', async () => {
      const invalidId = 'not-a-valid-object-id';

      await expect(controller.delete(invalidId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Integration - Schema Validation', () => {
    it('should enforce MongoDB schema validation for column limits', async () => {
      const templateWithInvalidColumns = {
        title: 'Invalid Template',
        fields: [],
        usedPositions: [
          { row: 1, col: 0 }, // col 0 excede limite (deve ser 1-6)
          { row: 1, col: 7 }, // col 7 excede limite (deve ser 1-6)
          { row: 1, col: 8 }, // col 8 excede limite (deve ser 1-6)
        ],
      };

      await expect(templateModel.create(templateWithInvalidColumns)).rejects.toThrow();
    });

    it('should enforce MongoDB schema validation for row limits', async () => {
      const templateWithInvalidRows = {
        title: 'Invalid Template',
        fields: [],
        usedPositions: [
          { row: 0, col: 1 }, // row 0 excede limite (deve ser 1-20)
          { row: 21, col: 1 }, // row 21 excede limite (deve ser 1-20)
          { row: 25, col: 1 }, // row 25 excede limite (deve ser 1-20)
        ],
      };

      await expect(templateModel.create(templateWithInvalidRows)).rejects.toThrow();
    });

    it('should accept valid column and row ranges', async () => {
      const validTemplate = {
        title: 'Valid Template',
        fields: [],
        usedPositions: [
          { row: 1, col: 1 }, // Dentro do limite
          { row: 10, col: 3 }, // Dentro do limite
          { row: 20, col: 6 }, // Dentro do limite
        ],
      };

      const created = await templateModel.create(validTemplate);
      expect(created).toBeDefined();
      expect(created.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 10, col: 3 }),
          expect.objectContaining({ row: 20, col: 6 }),
        ]),
      );
    });
  });

  async function createTemplate(title: string) {
    return await controller.create(
      new CreateTemplateDto(title, [new FieldRequestDto('title', FieldType.TEXT, [new PositionDto(1, 1)])]),
    );
  }
});
