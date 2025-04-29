import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import Field, { FieldSchema } from './entities/field.entity';
import { MongooseModule } from '@nestjs/mongoose';
import CreateFieldService from './services/field/create/create-field.service';
import FindFieldService from './services/field/find/find-field.service';
import UpdateFieldService from './services/field/update/update-field.service';
import DeleteFieldService from './services/field/delete/delete-field.service';
import FieldTypeService from './services/field-type/field-type.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Field.name, schema: FieldSchema }])],
  controllers: [FieldsController],
  providers: [CreateFieldService, FindFieldService, UpdateFieldService, DeleteFieldService, FieldTypeService],
  exports: [CreateFieldService, FindFieldService, UpdateFieldService, DeleteFieldService, FieldTypeService],
})
export class FieldsModule {}
