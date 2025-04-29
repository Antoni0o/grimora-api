import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateFieldDto from '../../../dtos/create-field.dto';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';

@Injectable()
export default class CreateFieldService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @Inject(FieldTypeService) private fieldTypeService: FieldTypeService,
  ) {}

  async create(request: CreateFieldDto): Promise<Field> {
    await this.fieldTypeService.find(request.typeId);

    const fieldKey = this.createKey(request.name);

    const newField = this.fieldModel.create({
      name: request.name,
      key: fieldKey,
      description: request.description ?? '',
      config: request.config ?? {},
      required: request.required ?? false,
      readonly: request.readonly ?? false,
      type: request.typeId,
      value: request.value ?? undefined,
    });

    return newField;
  }

  private createKey(name: string) {
    return name.replace(/\s+/g, '_').toLowerCase();
  }
}
