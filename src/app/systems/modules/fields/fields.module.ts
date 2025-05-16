import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import FieldTypeService from '../field-types/field-type.service';
import Field, { FieldSchema } from './field.entity';
import { FieldsController } from './fields.controller';
import CreateFieldService from './services/create/create-field.service';
import DeleteFieldService from './services/delete/delete-field.service';
import FindFieldService from './services/find/find-field.service';
import UpdateFieldService from './services/update/update-field.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Field.name, schema: FieldSchema }])],
  controllers: [FieldsController],
  providers: [CreateFieldService, FindFieldService, UpdateFieldService, DeleteFieldService, FieldTypeService],
  exports: [CreateFieldService, FindFieldService, UpdateFieldService, DeleteFieldService, FieldTypeService],
})
export class FieldsModule {}
