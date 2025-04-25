import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Field from '../../entities/field.entity';
import { Document, Model, Types } from 'mongoose';
import UpdateFieldDto from '../../dtos/update-field.dto';
import FieldType from '../../entities/field-type.entity';

type MongooseDocumentModel<T> = Document<unknown, object, T> & T & { _id: Types.ObjectId } & { __v: number };

@Injectable()
export default class UpdateFieldService {
  request?: UpdateFieldDto;

  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @InjectModel(FieldType.name) private fieldTypeModel: Model<FieldType>,
  ) {}

  async update(fieldId: string, request: UpdateFieldDto) {
    this.request = request;

    const field = await this.fieldModel.findById(fieldId).exec();

    if (field) {
      this.updateFieldData(field);
    }

    if (!field) throw new NotFoundException(`Field with id: ${fieldId} not found!`);

    await this.saveField(field, fieldId);
  }

  private updateFieldData(field: Field) {
    if (!this.request) throw new BadRequestException('Request not provided!');

    if (this.isNotNullOrEmpty(this.request.name)) {
      field.name = this.request.name!;
      field.key = this.createKey(field.name);
    }

    if (this.request.description) field.description = this.request.description!;

    if (this.request.config) field.config = this.request.config;

    if (this.request.readonly) field.readonly = this.request.readonly;

    if (this.request.required) field.required = this.request.required;

    if (this.request.value) field.value = this.request.value;
  }

  private isNotNullOrEmpty(value: string | undefined | null) {
    return value !== null || value !== undefined || value !== '';
  }

  private createKey(name: string): string {
    return name.replace(/\s+/g, '_').toLowerCase();
  }

  private async saveField(field: MongooseDocumentModel<Field>, fieldId: string) {
    if (!this.request) throw new BadRequestException('Request not provided!');

    await field.save();

    if (this.isNotNullOrEmpty(this.request.typeId)) {
      const fieldType = await this.fieldTypeModel.findById(this.request.typeId);

      if (!fieldType) throw new NotFoundException(`Field Type not found with id: ${this.request.typeId}`);

      this.fieldModel.updateOne({ _id: fieldId }, { type: this.request.typeId });
    }
  }
}
