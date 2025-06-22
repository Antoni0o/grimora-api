import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { FieldType } from '../domain/enums/field-type.enum';
import { TEMPLATE_REPOSITORY } from '../domain/constants/template.constants';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { FieldResponseDto } from './dto/field-response.dto';
import { Types } from 'mongoose';
import { Template } from '../domain/entities/template.entity';
import { Field } from '../domain/entities/fields/field.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { TemplateResponseDto } from './dto/template-response.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { create } from 'domain';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: ITemplateRepository

  const templateId = new Types.ObjectId();
  const templateTitle = "DnD Template";
  const fieldTitle = "Name Field";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: TEMPLATE_REPOSITORY,
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
    repository = module.get<ITemplateRepository>(TEMPLATE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a template', async () => {
    // arrange
    const fieldDto = new CreateFieldDto(fieldTitle, FieldType.TEXT);
    const request = new CreateTemplateDto(templateTitle, [fieldDto]);

    const template = createTemplate(templateId, templateTitle)

    jest.spyOn(repository, 'create').mockResolvedValue(template);

    // act
    const response = await service.create(request);

    // assert
    expect(response).toStrictEqual(new TemplateResponseDto(
      template.id,
      request.title,
      [
        new FieldResponseDto(
          template.fields[0].id,
          fieldDto.title,
          fieldDto.type
        )
      ]
    ));

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: request.title, fields: expect.arrayContaining([
          expect.objectContaining({
            title: fieldDto.title,
            type: fieldDto.type,
          })
        ])
      })
    )
  });

  it('should not create a template when repository fails', async () => {
    // arrange
    const fieldDto = new CreateFieldDto(fieldTitle, FieldType.NUMBER);
    const request = new CreateTemplateDto(templateTitle, [fieldDto]);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: templateTitle, fields: expect.arrayContaining([
          expect.objectContaining({
            title: fieldDto.title,
            type: fieldDto.type,
          })
        ])
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
      new TemplateResponseDto(
        templateId.toHexString(),
        templateTitle,
        [new FieldResponseDto(template.fields[0].id, template.fields[0].title, template.fields[0].type)]
      )
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

  it('should find system by id', async () => {
      // arrange
      const template = createTemplate(templateId, templateTitle) ;
  
      jest.spyOn(repository, 'findById').mockResolvedValue(template);
  
      // act
      const response = await service.findOne(templateId.toHexString());
  
      // assert
      expect(response.id).toBe(template.id);
    });
  
    it('should not find system by id when repository returns null', async () => {
      // arrange
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
  
      // act
      await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);
  
      // assert
      expect(repository.findById).toHaveBeenCalled();
    });
});

function createTemplate(templateId: Types.ObjectId, templateTitle: string): Template {
  return new Template(templateId.toHexString(), templateTitle, [
    FieldFactory.create({
      id: new Types.ObjectId().toHexString(),
      title: "Name Field",
      type: FieldType.TEXT,
    })
  ]);
}