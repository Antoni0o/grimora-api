import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import FieldType from '../../entities/field-type.entity';
import Field from '../../entities/field.entity';
import UpdateFieldService from './update-field.service';

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
          provide: getModelToken(FieldType.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<UpdateFieldService>(UpdateFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
