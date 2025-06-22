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

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: ITemplateRepository

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
    const fieldDto = new CreateFieldDto('Name', FieldType.TEXT);
    const request = new CreateTemplateDto('DnD Template', [fieldDto]);

    const templateId = new Types.ObjectId();
    const template = new Template(templateId.toHexString(), request.title, [
      FieldFactory.create({
        id: new Types.ObjectId().toHexString(),
        title: fieldDto.title,
        type: fieldDto.type,
      })
    ])

    jest.spyOn(repository, 'create').mockResolvedValue(template);

    // act
    const response = await service.create(request);

    // assert
    expect(response).toStrictEqual({
      id: template.id,
      title: request.title,
      fields: [
        {
          id: template.fields[0].id,
          title: fieldDto.title,
          type: fieldDto.type,
          key: undefined,
          value: undefined,
          resourceId: undefined,
          fields: []
        } as FieldResponseDto
      ]
    } as TemplateResponseDto);

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
  })
});
