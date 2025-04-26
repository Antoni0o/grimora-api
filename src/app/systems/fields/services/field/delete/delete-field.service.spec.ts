import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import DeleteFieldService from './delete-field.service';
import Field from '../../../entities/field.entity';

describe('DeleteFieldService', () => {
  let service: DeleteFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteFieldService,
        {
          provide: getModelToken(Field.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<DeleteFieldService>(DeleteFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
