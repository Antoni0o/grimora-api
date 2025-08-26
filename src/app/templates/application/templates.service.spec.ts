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
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateTemplateDto } from './dto/update-template.dto';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: ITemplateRepository;

  const templateId = new Types.ObjectId();
  const templateTitle = 'DnD Template';
  const fieldTitle = 'Name Field';

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

  it('should create a template', async () => {
    // arrange
    const fieldDto = new FieldRequestDto(fieldTitle, FieldType.TEXT);
    const request = new CreateTemplateDto(templateTitle, [fieldDto]);

    const template = createTemplate(templateId, templateTitle);

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
    const fieldDto = new FieldRequestDto(fieldTitle, FieldType.NUMBER);
    const request = new CreateTemplateDto(templateTitle, [fieldDto]);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: templateTitle,
        fields: expect.arrayContaining([
          expect.objectContaining({
            title: fieldDto.title,
            type: fieldDto.type,
          }),
        ]),
      }),
    );
  });

  it('should find all templates', async () => {
    // arrange
    const template = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findAll').mockResolvedValue([template]);

    // act
    const response = await service.findAll();

    // assert
    expect(response).toEqual([
      new TemplateResponseDto(templateId.toHexString(), templateTitle, [
        new FieldResponseDto(template.fields[0].id, template.fields[0].title, template.fields[0].type),
      ]),
    ]);

    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should not find all templates when repository fails', async () => {
    // arrange
    const template = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findAll').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should find template by id', async () => {
    // arrange
    const template = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findById').mockResolvedValue(template);

    // act
    const response = await service.findOne(templateId.toHexString());

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

  it('should update a template adding a field', async () => {
    // arrange
    const templateToUpdate = createTemplate(templateId, templateTitle);

    const request = new UpdateTemplateDto();
    request.title = 'New Title';
    request.fields = [
      new FieldRequestDto('Age Field', FieldType.NUMBER),
      new FieldRequestDto(fieldTitle, FieldType.TEXT, templateToUpdate.fields[0].id),
    ];

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

    // act
    const response = await service.update(templateId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      templateToUpdate.id,
      expect.objectContaining({
        id: templateToUpdate.id,
        title: request.title,
        fields: expect.arrayContaining([
          expect.objectContaining({
            id: '',
            title: request.fields[0].title,
            type: request.fields[0].type,
          }),
          expect.objectContaining({
            id: request.fields[1].id,
            title: request.fields[1].title,
            type: request.fields[1].type,
          }),
        ]),
      }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
  });

  it('should update a template removing a field', async () => {
    // arrange
    const templateToUpdate = createTemplate(templateId, templateTitle);

    const request = new UpdateTemplateDto();
    request.title = 'New Title';
    request.fields = [];

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

    // act
    const response = await service.update(templateId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      templateToUpdate.id,
      expect.objectContaining({ title: request.title, fields: request.fields }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
  });

  it('should update a template editing a field', async () => {
    // arrange
    const templateToUpdate = createTemplate(templateId, templateTitle);

    const request = new UpdateTemplateDto();
    request.title = 'New Title';
    request.fields = [new FieldRequestDto('Apperance Description', FieldType.TEXT, templateToUpdate.fields[0].id)];

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(templateToUpdate);

    // act
    const response = await service.update(templateId.toHexString(), request);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateToUpdate.id);

    expect(repository.update).toHaveBeenCalledWith(
      templateToUpdate.id,
      expect.objectContaining({ title: request.title, fields: request.fields }),
    );

    expect(response).toStrictEqual(expect.objectContaining({ id: templateToUpdate.id }));
  });

  it('should not update when template is not found', async () => {
    // arrange
    const templateToUpdate = createTemplate(templateId, templateTitle);

    const request = new UpdateTemplateDto();
    request.title = 'new title';
    request.fields = [
      new FieldRequestDto('Age Field', FieldType.NUMBER),
      new FieldRequestDto(fieldTitle, FieldType.TEXT, templateToUpdate.fields[0].id),
    ];

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update('unexistent-id', request)).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith('unexistent-id');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should not update template when repository fails', async () => {
    // arrange
    const templateToUpdate = createTemplate(templateId, templateTitle);

    const request = new UpdateTemplateDto();
    request.title = 'new title';
    request.fields = [];

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToUpdate);
    jest.spyOn(repository, 'update').mockResolvedValue(null);

    // act
    await expect(service.update(templateId.toHexString(), request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateId.toHexString());
    expect(repository.update).toHaveBeenCalledWith(
      templateToUpdate.id,
      expect.objectContaining({ title: request.title, fields: request.fields }),
    );
  });

  it('should delete a template', async () => {
    // arrange
    const templateToDelete = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(true);

    // act
    const response = await service.delete(templateId.toHexString());

    // assert
    expect(response).toBeTruthy();
    expect(repository.findById).toHaveBeenCalledWith(templateId.toHexString());
    expect(repository.delete).toHaveBeenCalledWith(templateId.toHexString());
  });

  it('should not delete when template is not found', async () => {
    // arrange
    const templateToDelete = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete(templateId.toHexString())).rejects.toThrow(NotFoundException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateId.toHexString());
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should not delete template when repository fails', async () => {
    // arrange
    const templateToDelete = createTemplate(templateId, templateTitle);

    jest.spyOn(repository, 'findById').mockResolvedValue(templateToDelete);
    jest.spyOn(repository, 'delete').mockResolvedValue(false);

    // act
    await expect(service.delete(templateId.toHexString())).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.findById).toHaveBeenCalledWith(templateId.toHexString());
    expect(repository.delete).toHaveBeenCalledWith(templateId.toHexString());
  });
});

function createTemplate(templateId: Types.ObjectId, templateTitle: string): Template {
  return new Template(templateId.toHexString(), templateTitle, [
    FieldFactory.create({
      id: new Types.ObjectId().toHexString(),
      title: 'Name Field',
      type: FieldType.TEXT,
    }),
  ]);
}
