import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { FieldRequestDto } from './dto/field-request.dto';
import { FieldType } from '../domain/enums/field-type.enum';
import { TEMPLATES_REPOSITORY } from '../domain/constants/template.constants';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { FieldResponseDto } from './dto/field-response.dto';
import { Types } from 'mongoose';
import { Template } from '../domain/entities/template.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { TemplateResponseDto } from './dto/template-response.dto';
import { InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateTemplateDto } from './dto/update-template.dto';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: ITemplateRepository;

  const TEST_TEMPLATE_ID = new Types.ObjectId();
  const TEST_TEMPLATE_TITLE = 'DnD Template';
  const TEST_FIELD_TITLE = 'Name Field';
  const TEST_FIELD_ID = new Types.ObjectId().toHexString();

  const createTestFieldDto = (
    title: string = TEST_FIELD_TITLE,
    type: FieldType = FieldType.TEXT,
    columns: number[] = [1],
    rows: number[] = [1],
    id?: string,
  ) => new FieldRequestDto(title, type, columns, rows, id);

  const createTestTemplate = (
    templateId: Types.ObjectId = TEST_TEMPLATE_ID,
    templateTitle: string = TEST_TEMPLATE_TITLE,
  ): Template => {
    return new Template(templateId.toHexString(), templateTitle, [
      FieldFactory.create({
        id: TEST_FIELD_ID,
        title: TEST_FIELD_TITLE,
        type: FieldType.TEXT,
        columns: [1],
        rows: [1],
      }),
    ]);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: TEMPLATES_REPOSITORY,
          useValue: <ITemplateRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    repository = module.get<ITemplateRepository>(TEMPLATES_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create operations', () => {
    it('should create a template', async () => {
      // arrange
      const fieldDto = createTestFieldDto();
      const request = new CreateTemplateDto(TEST_TEMPLATE_TITLE, [fieldDto]);
      const template = createTestTemplate();

      jest.spyOn(repository, 'create').mockResolvedValue(template);

      // act
      const response = await service.create(request);

      // assert
      expect(response).toStrictEqual(
        new TemplateResponseDto(template.id, request.title, [
          new FieldResponseDto(template.fields[0].id, fieldDto.title, fieldDto.type),
        ]),
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: request.title,
          fields: expect.arrayContaining([
            expect.objectContaining({
              title: fieldDto.title,
              type: fieldDto.type,
            }),
          ]),
        }),
      );
    });

    it('should not create a template when repository fails', async () => {
      // arrange
      const fieldDto = createTestFieldDto('Test Field', FieldType.NUMBER);
      const request = new CreateTemplateDto(TEST_TEMPLATE_TITLE, [fieldDto]);

      jest.spyOn(repository, 'create').mockResolvedValue(null);

      // act
      await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

      // assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: TEST_TEMPLATE_TITLE,
          fields: expect.arrayContaining([
            expect.objectContaining({
              title: fieldDto.title,
              type: fieldDto.type,
            }),
          ]),
        }),
      );
    });

    it('should throw BadRequestException when field cannot be added', async () => {
      // arrange - field with invalid columns/rows that exceed limits
      const fieldDto = createTestFieldDto('Invalid Field', FieldType.TEXT, [100], [100]);
      const request = new CreateTemplateDto(TEST_TEMPLATE_TITLE, [fieldDto]);

      // act & assert
      await expect(service.create(request)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Read operations', () => {
    it('should find all templates', async () => {
      // arrange
      const template = createTestTemplate();

      jest.spyOn(repository, 'findAll').mockResolvedValue([template]);

      // act
      const response = await service.findAll();

      // assert
      expect(response).toEqual([
        new TemplateResponseDto(TEST_TEMPLATE_ID.toHexString(), TEST_TEMPLATE_TITLE, [
          new FieldResponseDto(template.fields[0].id, template.fields[0].title, template.fields[0].type),
        ]),
      ]);

      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should not find all templates when repository fails', async () => {
      // arrange
      jest.spyOn(repository, 'findAll').mockResolvedValue(null);

      // act
      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

      // assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should find template by id', async () => {
      // arrange
      const template = createTestTemplate();

      jest.spyOn(repository, 'findById').mockResolvedValue(template);

      // act
      const response = await service.findOne(TEST_TEMPLATE_ID.toHexString());

      // assert
      expect(response.id).toBe(template.id);
    });

    it('should not find template by id when repository returns null', async () => {
      // arrange
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      // act
      await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);

      // assert
      expect(repository.findById).toHaveBeenCalled();
    });
  });

  describe('Update operations', () => {
    it('should update a template adding a field', async () => {
      // arrange
      const templateToUpdate = createTestTemplate();

      const request = new UpdateTemplateDto();
      request.title = 'New Title';
      request.fields = [
        createTestFieldDto('Age Field', FieldType.NUMBER, [2], [2]), // New field without ID - should be added
        createTestFieldDto(TEST_FIELD_TITLE, FieldType.TEXT, [1], [1], TEST_FIELD_ID), // Existing field with ID - should be updated
      ];

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
      jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

      // act
      const response = await service.update(TEST_TEMPLATE_ID.toHexString(), request);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);
      expect(repository.update).toHaveBeenCalledWith(
        templateToUpdate.id,
        expect.objectContaining({
          title: request.title,
          fields: expect.any(Array),
        }),
      );
      expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
    });

    it('should update a template removing fields (empty fields array)', async () => {
      // arrange
      const templateToUpdate = createTestTemplate();

      const request = new UpdateTemplateDto();
      request.title = 'New Title';
      request.fields = []; // Empty array - no fields to add or update

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
      jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

      // act
      const response = await service.update(TEST_TEMPLATE_ID.toHexString(), request);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);
      expect(repository.update).toHaveBeenCalledWith(
        templateToUpdate.id,
        expect.objectContaining({
          title: request.title,
          fields: expect.any(Array),
        }),
      );
      expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
    });

    it('should update a template editing an existing field', async () => {
      // arrange
      const templateToUpdate = createTestTemplate();

      const request = new UpdateTemplateDto();
      request.title = 'New Title';
      request.fields = [createTestFieldDto('Appearance Description', FieldType.TEXT, [2], [2], TEST_FIELD_ID)];

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
      jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

      // act
      const response = await service.update(TEST_TEMPLATE_ID.toHexString(), request);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);
      expect(repository.update).toHaveBeenCalledWith(
        templateToUpdate.id,
        expect.objectContaining({
          title: request.title,
          fields: expect.arrayContaining([
            expect.objectContaining({
              title: 'Appearance Description',
              type: FieldType.TEXT,
            }),
          ]),
        }),
      );
      expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
    });

    it('should not update when template is not found', async () => {
      // arrange
      const request = new UpdateTemplateDto();
      request.title = 'new title';
      request.fields = [
        createTestFieldDto('Age Field', FieldType.NUMBER, [2], [2]),
        createTestFieldDto(TEST_FIELD_TITLE, FieldType.TEXT, [1], [1], TEST_FIELD_ID),
      ];

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      // act
      await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

      // assert
      expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should not update template when repository fails', async () => {
      // arrange
      const templateToUpdate = createTestTemplate();

      const request = new UpdateTemplateDto();
      request.title = 'new title';
      request.fields = [];

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      // act
      await expect(service.update(TEST_TEMPLATE_ID.toHexString(), request)).rejects.toThrow(
        InternalServerErrorException,
      );

      // assert
      expect(repository.findById).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
      expect(repository.update).toHaveBeenCalledWith(
        templateToUpdate.id,
        expect.objectContaining({
          title: request.title,
          fields: expect.any(Array),
        }),
      );
    });

    it('should throw BadRequestException when field operations fail', async () => {
      // arrange
      const templateToUpdate = createTestTemplate();

      const request = new UpdateTemplateDto();
      request.title = 'new title';
      request.fields = [
        createTestFieldDto('Invalid Field', FieldType.TEXT, [100], [100]), // Invalid columns/rows that exceed limits
      ];

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);

      // act
      await expect(service.update(TEST_TEMPLATE_ID.toHexString(), request)).rejects.toThrow(BadRequestException);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('Delete operations', () => {
    it('should delete a template', async () => {
      // arrange
      const templateToDelete = createTestTemplate();

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToDelete);
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      // act
      const response = await service.delete(TEST_TEMPLATE_ID.toHexString());

      // assert
      expect(response).toBeTruthy();
      expect(repository.findById).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
      expect(repository.delete).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
    });

    it('should not delete when template is not found', async () => {
      // arrange
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      // act
      await expect(service.delete(TEST_TEMPLATE_ID.toHexString())).rejects.toThrow(NotFoundException);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should not delete template when repository fails', async () => {
      // arrange
      const templateToDelete = createTestTemplate();

      jest.spyOn(repository, 'findById').mockResolvedValue(templateToDelete);
      jest.spyOn(repository, 'delete').mockResolvedValue(false);

      // act
      await expect(service.delete(TEST_TEMPLATE_ID.toHexString())).rejects.toThrow(InternalServerErrorException);

      // assert
      expect(repository.findById).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
      expect(repository.delete).toHaveBeenCalledWith(TEST_TEMPLATE_ID.toHexString());
    });
  });
});
