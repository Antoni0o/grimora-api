import { Test, TestingModule } from '@nestjs/testing';
import { SheetsController } from './sheets.controller';
import { SheetsService } from './sheets.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import { SheetMongoSchema, SheetSchema } from '../infraestructure/sheets.schema';
import { SHEETS_REPOSITORY } from '../domain/constants/sheets.constants';
import { SheetsRepository } from '../infraestructure/sheets.mongoose.repository';
import { getModelToken } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { TemplateMongoSchema, TemplateSchema } from 'src/app/templates/infraestructure/template.schema';
import { UserSession } from 'src/lib/auth';

describe('SheetsController', () => {
  let controller: SheetsController;
  let service: SheetsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let sheetModel: Model<SheetMongoSchema>;
  let templateModel: Model<TemplateMongoSchema>;

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
    sheetModel = mongoConnection.model(SheetMongoSchema.name, SheetSchema);
    templateModel = mongoConnection.model(TemplateMongoSchema.name, TemplateSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SheetsController],
      providers: [
        SheetsService,
        {
          provide: SHEETS_REPOSITORY,
          useClass: SheetsRepository,
        },
        {
          provide: getModelToken(SheetMongoSchema.name),
          useValue: sheetModel,
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

    controller = module.get<SheetsController>(SheetsController);
    service = module.get<SheetsService>(SheetsService);
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
    it('should create a new sheet', async () => {
      // Criar um template primeiro
      const templateId = new Types.ObjectId();
      await templateModel.create({
        _id: templateId,
        title: 'Test Template',
        name: 'Test Template',
        description: 'Test Template Description',
        ownerId: userId,
        elements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createSheetDto: CreateSheetDto = {
        title: 'Test Sheet',
        templateId: templateId.toHexString(),
        ownerId: uuid(),
        ownerSheetsLimit: 1,
        ownerSheetsCount: 0,
        values: { teste: 12222 },
      };

      const createdSheet = await controller.create(createSheetDto, userSession);

      expect(createdSheet).toBeDefined();
      expect(createdSheet.title).toEqual(createSheetDto.title);
      expect(createdSheet.templateId).toEqual(createSheetDto.templateId);
      expect(createdSheet.id).toBeDefined();

      const foundSheet = await sheetModel.findById(createdSheet.id);
      expect(foundSheet).toBeDefined();
      expect(foundSheet?.title).toEqual(createSheetDto.title);
    });
  });

  describe('findAll', () => {
    it('should return an array of sheets', async () => {
      const sheet1 = await createSheet('sheet 1');
      const sheet2 = await createSheet('sheet 2');

      const sheets = await controller.findAll();

      expect(sheets).toBeDefined();
      expect(sheets.length).toEqual(2);
      expect(sheets[0].title).toEqual(sheet1.title);
      expect(sheets[1].title).toEqual(sheet2.title);
    });

    it('should return an empty array if no sheets exist', async () => {
      const sheets = await controller.findAll();
      expect(sheets).toBeDefined();
      expect(sheets.length).toEqual(0);
    });
  });

  describe('findByOwnerId', () => {
    it('should return an array of sheets for the owner', async () => {
      const ownerId = uuid();
      const sheet1 = await createSheet('sheet 1', ownerId);
      const sheet2 = await createSheet('sheet 2', ownerId);
      await createSheet('sheet 3', uuid());

      userSession.user.id = ownerId;

      const sheets = await controller.findByOwnerId(userSession);

      expect(sheets).toBeDefined();
      expect(sheets.length).toEqual(2);
      expect(sheets[0].title).toEqual(sheet1.title);
      expect(sheets[1].title).toEqual(sheet2.title);
      expect(sheets[0].ownerId).toEqual(ownerId);
      expect(sheets[1].ownerId).toEqual(ownerId);
    });

    it('should return an empty array if the owner has no sheets', async () => {
      const ownerId = uuid();
      await createSheet('sheet 1', uuid());
      await createSheet('sheet 2', uuid());

      userSession.user.id = ownerId;

      const sheets = await controller.findByOwnerId(userSession);
      expect(sheets).toBeDefined();
      expect(sheets.length).toEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return a single sheet by id', async () => {
      const createdSheet = await createSheet('sheet 1');
      const foundSheet = await controller.findOne(createdSheet.id);

      expect(foundSheet).toBeDefined();
      expect(foundSheet.id).toEqual(createdSheet.id);
      expect(foundSheet.title).toEqual(createdSheet.title);
    });

    it('should throw NotFoundException if sheet is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if an invalid id is provided', async () => {
      const invalidId = 'invalid-mongo-id';
      await expect(controller.findOne(invalidId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing sheet', async () => {
      const createdSheet = await createSheet('sheet 1', userId);
      const updateSheetDto: UpdateSheetDto = {
        title: 'New Name',
        values: {},
      };

      const updatedSheet = await controller.update(createdSheet.id, updateSheetDto, userSession);

      expect(updatedSheet).toBeDefined();
      expect(updatedSheet.id).toEqual(createdSheet.id);
      expect(updatedSheet.title).toEqual(updateSheetDto.title);
      expect(updatedSheet.values).toEqual(updateSheetDto.values);

      const foundSheet = await sheetModel.findById(createdSheet.id);
      expect(foundSheet?.title).toEqual(updateSheetDto.title);
    });

    it('should throw NotFoundException if sheet to update is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const updateSheetDto: UpdateSheetDto = { title: 'New Name', values: {} };

      await expect(controller.update(nonExistentId, updateSheetDto, userSession)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing sheet', async () => {
      const createdSheet = await createSheet('sheet 1', userId);

      await controller.delete(createdSheet.id, userSession);

      const foundSheet = await sheetModel.findById(createdSheet.id);
      expect(foundSheet).toBeNull();
    });

    it('should throw NotFoundException if sheet to delete is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();

      await expect(controller.delete(nonExistentId, userSession)).rejects.toThrow(NotFoundException);
    });
  });

  async function createSheet(title: string, userId?: string) {
    const ownerId = userId ?? uuid();
    userSession.user.id = ownerId;

    const templateId = new Types.ObjectId();
    await templateModel.create({
      _id: templateId,
      title: 'Test Template',
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await controller.create(
      {
        title,
        ownerId,
        ownerSheetsCount: 0,
        ownerSheetsLimit: 1,
        templateId: templateId.toHexString(),
        values: {
          value1: 2212,
        },
      },
      userSession,
    );
  }
});
