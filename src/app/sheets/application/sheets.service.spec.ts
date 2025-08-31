import { Test, TestingModule } from '@nestjs/testing';
import { SheetsService } from './sheets.service';
import { ISheetsRepository } from '../domain/repositories/sheets.repository.interface';
import { Types } from 'mongoose';
import { SHEETS_REPOSITORY } from '../domain/constants/sheets.constants';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { Sheet } from '../domain/entities/sheet.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { UpdateSheetDto } from './dto/update-sheet.dto';

describe('SheetsService', () => {
  let service: SheetsService;
  let repository: ISheetsRepository;

  const sheetId = new Types.ObjectId().toHexString();
  const templateId = 'templateID';
  const ownerId = 'ownerUUID';
  const title = 'new rpg sheet';
  const values: Record<string, unknown> = { id1: 122 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        {
          provide: SHEETS_REPOSITORY,
          useValue: <ISheetsRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
    repository = module.get<ISheetsRepository>(SHEETS_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a sheet', async () => {
    // arrange
    const request = new CreateSheetDto(title, ownerId, templateId, values);

    const createdSheet = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'create').mockResolvedValue(createdSheet);

    // act
    const response = await service.create(request);

    // assert
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ title, ownerId, templateId, values }));
    expect(response).toStrictEqual(expect.objectContaining({ id: createdSheet.id }));
  });

  it('should not create a sheet when repository fails', async () => {
    // arrange
    const request = new CreateSheetDto(title, ownerId, templateId, values);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: '', title, ownerId, templateId, values }),
    );
  });

  it('should find all sheets', async () => {
    // arrange
    const sheet = new Sheet(sheetId, title, ownerId, templateId, values);

    jest.spyOn(repository, 'findAll').mockResolvedValue([sheet]);

    // act
    const response = await service.findAll();

    // assert
    expect(response.length).toBe(1);
    expect(response.at(0)?.id).toBe(sheet.id);
  });

  it('should not find all sheets when repository fails', async () => {
    // arrange
    jest.spyOn(repository, 'findAll').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should find sheet by id', async () => {
    // arrange
    const sheet = new Sheet(sheetId, title, ownerId, templateId, values);

    jest.spyOn(repository, 'findById').mockResolvedValue(sheet);

    // act
    const response = await service.findOne(sheet.id);

    // assert
    expect(response.id).toBe(sheet.id);
  });

  it('should not find sheet by id when repository returns null', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should update a sheet', async () => {
    // arrange
    const request = new UpdateSheetDto();
    request.title = 'new title';
    request.values = {
      id1: values['id1'],
      id2: 122222,
    };
    request.requesterId = ownerId;

    const sheetToUpdate = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToUpdate);

    const updatedSheet = new Sheet(sheetId, request.title, ownerId, templateId, request.values);
    jest.spyOn(repository, 'update').mockResolvedValue(updatedSheet);

    // act
    const response = await service.update(sheetId, request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(updatedSheet.id);

    expect(repository.update).toHaveBeenCalledWith(
      updatedSheet.id,
      expect.objectContaining({ title: request.title, values: request.values }),
    );

    expect(response).toStrictEqual(
      expect.objectContaining({ id: updatedSheet.id, title: request.title, values: request.values }),
    );
  });

  it('should not update when sheet is not found', async () => {
    // arrange
    const request = new UpdateSheetDto();
    request.title = 'new title';

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update sheet when requester is not owner', async () => {
    // arrange
    const request = new UpdateSheetDto();
    request.title = 'new title';
    request.values = {
      id1: values['id1'],
      id2: 'new value',
    };
    request.requesterId = 'anotherUserId';

    const sheetToUpdate = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToUpdate);

    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(sheetId, request)).rejects.toThrow(BadRequestException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(sheetId);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update a sheet when repository fails', async () => {
    // arrange
    const request = new UpdateSheetDto();
    request.title = 'new title';
    request.values = {
      id1: values['id1'],
      id2: 'new value text',
    };
    request.requesterId = ownerId;

    const sheetToUpdate = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToUpdate);

    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(sheetId, request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(sheetId);
    expect(repository.update).toHaveBeenCalledWith(
      sheetId,
      expect.objectContaining({ title: request.title, values: request.values }),
    );
  });

  it('should delete a sheet', async () => {
    // arrange
    const requesterId = ownerId;

    const sheetToDelete = new Sheet(sheetId, title, ownerId, sheetId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToDelete);

    jest.spyOn(repository, 'delete').mockResolvedValue(true);

    // act
    const response = await service.delete(sheetId, requesterId);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(sheetId);
    expect(repository.delete).toHaveBeenCalledWith(sheetId);
    expect(response).toBe(true);
  });

  it('should not delete when sheet is not found', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.delete(sheetId, ownerId)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete a sheet when requester is not owner', async () => {
    // arrange
    const sheetToDelete = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToDelete);

    // act
    await expect(service.delete(sheetId, uuid())).rejects.toThrow(BadRequestException);

    // assert
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete sheet when repository fails', async () => {
    // arrange
    const sheetToDelete = new Sheet(sheetId, title, ownerId, templateId, values);
    jest.spyOn(repository, 'findById').mockResolvedValue(sheetToDelete);

    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete(sheetId, ownerId)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(sheetId);
    expect(repository.delete).toHaveBeenCalledWith(sheetId);
  });
});
