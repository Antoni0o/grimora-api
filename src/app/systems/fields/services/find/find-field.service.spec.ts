import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import Field from '../../entities/field.entity';
import FindFieldService from './find-field.service';

describe('FindFieldService', () => {
  let service: FindFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindFieldService,
        {
          provide: getModelToken(Field.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<FindFieldService>(FindFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
