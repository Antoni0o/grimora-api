/* eslint-disable @typescript-eslint/unbound-method */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import CreateFieldService from './create-field.service';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';
import CreateFieldDto from '../../../dtos/create-field.dto';
import FieldType from '../../../entities/field-type.entity';

type MongooseFieldModel = Field & {
  _id: Types.ObjectId;
  type: string;
  children: Array<string>;
};

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
    const field = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: request.name,
      required: true,
      type: fieldType._id.toString(),
      value: request.value,
    };

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);
    (fieldModelMock.create as jest.Mock).mockResolvedValue(field);

    // act
    const response = await service.create(request);

    // assert
    expect(response.name).toBe(request.name);
    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(request.typeId);
    expect(fieldModelMock.create).toHaveBeenCalled();
  });

  it('should create field with children', async () => {
    // arrange
    const childrenRequest = new CreateFieldDto();
    childrenRequest.name = 'age';
    childrenRequest.value = 20;
    childrenRequest.typeId = 'typeId';

    const request = getRequest();
    request.children = [childrenRequest];

    const fieldType = getFieldType();

    const children = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: childrenRequest.name,
      required: true,
      type: fieldType._id.toString(),
      value: childrenRequest.value,
    };

    const field = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: request.name,
      required: true,
      type: fieldType._id.toString(),
      value: request.value,
      children: [children._id.toString()],
    };

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);
    (fieldModelMock.create as jest.Mock).mockResolvedValueOnce(children).mockResolvedValueOnce(field);

    // act
    const response = await service.create(request);

    // assert
    expect(response.name).toBe(request.name);
    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(request.typeId);

    expect(fieldModelMock.create).toHaveBeenCalledTimes(2);
  });

  it('should create field with a children with a grandchildren', async () => {
    // arrange
    const grandChildrenRequest = new CreateFieldDto();
    grandChildrenRequest.name = 'life';
    grandChildrenRequest.value = 20;
    grandChildrenRequest.typeId = 'typeId';

    const childrenRequest = new CreateFieldDto();
    childrenRequest.name = 'stats';
    childrenRequest.typeId = 'typeId';
    childrenRequest.children = [grandChildrenRequest];

    const parentRequest = getRequest();
    parentRequest.children = [childrenRequest];

    const fieldType = getFieldType();

    const grandChildren = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: grandChildrenRequest.name,
      required: true,
      type: fieldType._id.toString(),
      value: grandChildrenRequest.value,
    };

    const children = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: childrenRequest.name,
      required: true,
      type: fieldType._id.toString(),
      value: childrenRequest.value,
      children: [grandChildren._id.toString()],
    };

    const field = <MongooseFieldModel>{
      _id: new Types.ObjectId(),
      name: parentRequest.name,
      required: true,
      type: fieldType._id.toString(),
      value: parentRequest.value,
      children: [children._id.toString()],
    };

    (fieldTypeServiceMock.find as jest.Mock).mockResolvedValue(fieldType);
    (fieldModelMock.create as jest.Mock)
      .mockResolvedValueOnce(grandChildren)
      .mockResolvedValueOnce(children)
      .mockResolvedValueOnce(field);

    // act
    const response = await service.create(parentRequest);

    // assert
    expect(response.name).toBe(parentRequest.name);
    expect(fieldTypeServiceMock.find).toHaveBeenCalledWith(parentRequest.typeId);

    expect(fieldModelMock.create).toHaveBeenCalledTimes(3);
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
