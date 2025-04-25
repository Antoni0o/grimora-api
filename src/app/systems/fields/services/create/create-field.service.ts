import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateFieldDto from '../../dtos/create-field.dto';
import FieldType from '../../entities/field-type.entity';
import Field from '../../entities/field.entity';

@Injectable()
export default class CreateFieldService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @InjectModel(FieldType.name) private fieldTypeModel: Model<FieldType>,
  ) {}

  async create(request: CreateFieldDto): Promise<Field> {
    const fieldType = await this.getFieldType(request.typeId);

    if (!fieldType) {
      throw new NotFoundException(`Field type with ID ${request.typeId} not found`);
    }

    const newField = new this.fieldModel({
      name: request.name,
      key: this.createKey(request.name),
      description: request.description ?? '',
      config: request.config ?? {},
      required: request.required ?? false,
      readonly: request.readonly ?? false,
      type: request.typeId,
      value: request.value ?? undefined,
    });

    return newField.save();
  }

  private async getFieldType(typeId: string) {
    return await this.fieldTypeModel.findById(typeId).exec();
  }

  private createKey(name: string) {
    return name.replace(/\s+/g, '_').toLowerCase();
  }
}
