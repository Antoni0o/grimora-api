import { Test, TestingModule } from '@nestjs/testing';
import { FieldsController } from './fields.controller';
import CreateFieldService from './services/create/create-field.service';

describe('FieldsController', () => {
  let controller: FieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldsController],
      providers: [CreateFieldService],
    }).compile();

    controller = module.get<FieldsController>(FieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
