/* eslint-disable @typescript-eslint/unbound-method */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import CreateFieldService from './create-field.service';
import Field from '../../field.entity';
import FieldTypeService from '../../../field-types/field-type.service';
import CreateFieldDto from '../../dtos/create-field.dto';
import CreateFieldMapper from './create-field.mapper';
import FieldType from '../../../field-types/field-type.entity';

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
        CreateFieldMapper,
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

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);

    // act
    const response = await service.create(request);

    // assert
    expect(response[0].name).toBe(request.name);

    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(request.typeId);
    expect(fieldModelMock.create).toHaveBeenCalled();
  });

  it('should create field with children', async () => {
    // arrange
    const childRequest = new CreateFieldDto();
    childRequest.name = 'age';
    childRequest.value = 20;
    childRequest.typeId = 'typeId';

    const request = getRequest();
    request.children = [childRequest];

    const fieldType = getFieldType();

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);

    // act
    const response = await service.create(request);

    // assert
    expect(response[0].name).toBe(childRequest.name);

    expect(response[1].name).toBe(request.name);
    expect(response[1].childrenIds).toStrictEqual([response[0]._id.toString()]);

    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(request.typeId);

    expect(fieldModelMock.create).toHaveBeenCalledTimes(1);
  });

  it('should create field with a children with a grandchildren', async () => {
    // arrange
    const grandChildRequest = new CreateFieldDto();
    grandChildRequest.name = 'life';
    grandChildRequest.value = 20;
    grandChildRequest.typeId = 'typeId';

    const childRequest = new CreateFieldDto();
    childRequest.name = 'stats';
    childRequest.typeId = 'typeId';
    childRequest.children = [grandChildRequest];

    const parentRequest = getRequest();
    parentRequest.children = [childRequest];

    const fieldType = getFieldType();

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);

    // act
    const response = await service.create(parentRequest);

    // assert
    expect(response[0].name).toBe(grandChildRequest.name);

    expect(response[1].name).toBe(childRequest.name);
    expect(response[1].childrenIds).toStrictEqual([response[0]._id.toString()]);

    expect(response[2].name).toBe(parentRequest.name);
    expect(response[2].childrenIds).toStrictEqual([response[1]._id.toString()]);

    expect(response.length).toEqual(3);
    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(parentRequest.typeId);

    expect(fieldModelMock.create).toHaveBeenCalledTimes(1);
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
  return <FieldType & { _id: Types.ObjectId }>{
    _id: new Types.ObjectId(),
    name: 'Text Field',
    key: 'text-field',
    default: true,
  };
}
