import { Test, TestingModule } from '@nestjs/testing';
import CreateFieldService from './create-field.service';
import { getModelToken } from '@nestjs/mongoose';
import Field, { FieldType } from '../../entities/field.entity';
import { Model } from 'mongoose';

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
          provide: getModelToken(FieldType.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<CreateFieldService>(CreateFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
