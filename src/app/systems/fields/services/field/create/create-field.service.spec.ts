/* eslint-disable @typescript-eslint/unbound-method */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import CreateFieldService from './create-field.service';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';
import CreateFieldDto from '../../../dtos/create-field.dto';
import FieldType from '../../../entities/field-type.entity';

describe('CreateFieldService', () => {
  let service: CreateFieldService;
  let fieldTypeServiceMock: FieldTypeService;
  let fieldModelMock: Model<Field>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFieldService,
        {
          provide: getModelToken(Field.name),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: FieldTypeService,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateFieldService>(CreateFieldService);

    fieldTypeServiceMock = module.get<FieldTypeService>(FieldTypeService);
    fieldModelMock = module.get<Model<Field>>(getModelToken(Field.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create field without children', async () => {
    // arrange
    const request = getRequest();
    const fieldType = getFieldType();
    const field = <Field>{
      name: request.name,
      required: true,
      type: fieldType,
      value: request.value,
    };

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);
    (fieldModelMock.create as jest.Mock).mockResolvedValue(field);

    // act
    const response = await service.create(request);

    // assert
    expect(response.name).toBe(request.name);
    expect(fieldTypeServiceMock.find).toHaveBeenCalled();
    expect(fieldModelMock.create).toHaveBeenCalled();
  });
});

function getRequest() {
  const request = new CreateFieldDto();

  request.name = 'Char name';
  request.value = 'Geralt of Riverton';
  request.typeId = 'typeId';

  return request;
}

function getFieldType() {
  return <FieldType>{
    name: 'Text Field',
    key: 'text-field',
    default: true,
  };
}
