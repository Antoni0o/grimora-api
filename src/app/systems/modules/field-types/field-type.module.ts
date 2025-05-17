import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import FieldTypeService from '../field-types/field-type.service';
import FieldType, { FieldTypeSchema } from './field-type.entity';

@Module({
  providers: [FieldTypeService],
  imports: [MongooseModule.forFeature([{ name: FieldType.name, schema: FieldTypeSchema }])],
  exports: [FieldTypeService],
})
export class FieldsModule {}
