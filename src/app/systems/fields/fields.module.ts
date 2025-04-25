import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import Field, { FieldSchema } from './entities/field.entity';
import { MongooseModule } from '@nestjs/mongoose';
import CreateFieldService from './services/create/create-field.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Field.name, schema: FieldSchema }])],
  controllers: [FieldsController],
  providers: [FieldsService, CreateFieldService],
  exports: [CreateFieldService],
})
export class FieldsModule {}
