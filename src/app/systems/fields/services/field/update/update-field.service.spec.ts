import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import UpdateFieldService from './update-field.service';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';

describe('UpdateFieldService', () => {
  let service: UpdateFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateFieldService,
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

    service = module.get<UpdateFieldService>(UpdateFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
