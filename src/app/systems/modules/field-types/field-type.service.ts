import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import UpdateFieldTypeDto from './dtos/update-field-type.dto';
import FieldType from './field-type.entity';
import CreateFieldTypeDto from './dtos/create-field-type.dto';

export type MongooseFieldTypeModel = Document<unknown, object, FieldType> &
  FieldType & { _id: Types.ObjectId } & { __v: number };

@Injectable()
export default class FieldTypeService {
  constructor(@InjectModel(FieldType.name) private fieldTypeModel: Model<FieldType>) {}

  async create(request: CreateFieldTypeDto): Promise<CreateFieldTypeDto> {
    const fieldType = await new this.fieldTypeModel({
      name: request.name,
      key: this.createKey(request.name),
      configSchema: request.configSchema,
      default: request.default,
    }).save();

    return new CreateFieldTypeDto(fieldType);
  }

  async update(fieldTypeId: string, request: UpdateFieldTypeDto): Promise<UpdateFieldTypeDto> {
    const fieldType = await this.find(fieldTypeId);

    if (request.name && request.name !== '') {
      fieldType.name = request.name;
      fieldType.key = this.createKey(request.name);
    }

    if (request.default !== undefined || request.default !== null) {
      fieldType.default = request.default;
    }

    if (request.configSchema !== undefined) {
      fieldType.configSchema = request.configSchema;
    }

    await fieldType.save();

    return new UpdateFieldTypeDto(fieldType);
  }

  async find(fieldTypeId: string): Promise<MongooseFieldTypeModel> {
    const fieldType = await this.fieldTypeModel.findById(fieldTypeId).exec();

    if (!fieldType) throw new NotFoundException(`Field Type with id: ${fieldTypeId} not found!`);

    return fieldType;
  }

  private createKey(name: string) {
    return name.replace(/\s+/g, '_').toLowerCase();
  }
}
