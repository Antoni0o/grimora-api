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

describe('SheetsController', () => {
  let controller: SheetsController;
  let service: SheetsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let sheetModel: Model<SheetMongoSchema>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    sheetModel = mongoConnection.model(SheetMongoSchema.name, SheetSchema);

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
      const createSheetDto: CreateSheetDto = {
        title: 'Test Sheet',
        templateId: new Types.ObjectId().toHexString(),
        ownerId: uuid(),
        values: { teste: 12222 },
      };
      const userId = uuid();
      const createdSheet = await controller.create(createSheetDto, userId);

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
      const userId = uuid();
      const createdSheet = await createSheet('sheet 1', userId);
      const updateSheetDto: UpdateSheetDto = {
        title: 'New Name',
        values: {},
      };

      const updatedSheet = await controller.update(createdSheet.id, updateSheetDto, userId);

      expect(updatedSheet).toBeDefined();
      expect(updatedSheet.id).toEqual(createdSheet.id);
      expect(updatedSheet.title).toEqual(updateSheetDto.title);
      expect(updatedSheet.values).toEqual(updateSheetDto.values);

      const foundSheet = await sheetModel.findById(createdSheet.id);
      expect(foundSheet?.title).toEqual(updateSheetDto.title);
    });

    it('should throw NotFoundException if sheet to update is not found', async () => {
      const userId = uuid();

      const nonExistentId = new Types.ObjectId().toHexString();
      const updateSheetDto: UpdateSheetDto = { title: 'New Name', values: {} };

      await expect(controller.update(nonExistentId, updateSheetDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing sheet', async () => {
      const userId = uuid();
      const createdSheet = await createSheet('sheet 1', userId);

      await controller.delete(createdSheet.id, userId);

      const foundSheet = await sheetModel.findById(createdSheet.id);
      expect(foundSheet).toBeNull();
    });

    it('should throw NotFoundException if sheet to remove is not found', async () => {
      const nonExistentId = new Types.ObjectId().toHexString();
      const userId = uuid();

      await expect(controller.delete(nonExistentId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  async function createSheet(title: string, userId?: string) {
    const ownerId = userId ?? uuid();

    return await controller.create(
      {
        title,
        ownerId,
        templateId: new Types.ObjectId().toHexString(),
        values: {
          value1: 2212,
        },
      },
      ownerId,
    );
  }
});
