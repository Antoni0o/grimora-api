import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Field from '../../field.entity';
import FindFieldDto from '../../dtos/find-field.dto';
import FieldType from '../../../field-types/field-type.entity';

@Injectable()
export default class FindFieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) {}

  async findById(fieldId: string): Promise<FindFieldDto> {
    const field = await this.fieldModel.findById(fieldId).populate<{ type: FieldType }>(FieldType.name).exec();

    if (!field) throw new NotFoundException(`Field with id: ${fieldId} not found!`);

    return new FindFieldDto(field);
  }
}
