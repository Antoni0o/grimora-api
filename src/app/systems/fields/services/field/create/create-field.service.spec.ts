import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import CreateFieldService from './create-field.service';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';

describe('CreateFieldService', () => {
  let service: CreateFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFieldService,
        {
          provide: getModelToken(Field.name),
          useValue: Model,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
