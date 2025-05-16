import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import FieldTypeService from '../../../field-types/field-type.service';
import Field from '../../field.entity';
import UpdateFieldDto from '../../dtos/update-field.dto';

@Injectable()
export default class UpdateFieldService {
  request?: UpdateFieldDto;

  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @Inject(FieldTypeService) private fieldTypeService: FieldTypeService,
  ) {}

  async update(fieldId: string, request: UpdateFieldDto) {
    const field = await this.fieldModel.findById(fieldId).exec();

    if (!field) throw new NotFoundException(`Field with id: ${fieldId} not found!`);

    await this.updateFieldData(field, request);

    await field.save();
  }

  private async updateFieldData(field: Field, request: UpdateFieldDto) {
    if (!request) throw new BadRequestException('Request not provided!');

    if (this.isNotNullOrEmpty(request.name)) field.name = request.name!;

    if (request.description) field.description = request.description!;

    if (request.config) field.config = request.config;

    if (request.readonly) field.readonly = request.readonly;

    if (request.required) field.required = request.required;

    if (request.value) field.value = request.value;

    if (request.typeId) {
      const fieldType = await this.fieldTypeService.find(request.typeId);

      field.type = fieldType;
    }
  }

  private isNotNullOrEmpty(value: string | undefined | null) {
    return value !== null || value !== undefined || value !== '';
  }
}
