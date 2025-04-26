import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import FieldType from '../../entities/field-type.entity';
import FieldTypeService from './field-type.service';

describe('FieldTypeService', () => {
  let service: FieldTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldTypeService,
        {
          provide: getModelToken(FieldType.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<FieldTypeService>(FieldTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
