import { Injectable, NotFoundException } from '@nestjs/common';
import FindFieldDto from '../../dtos/find-field.dto';
import { InjectModel } from '@nestjs/mongoose';
import Field from '../../entities/field.entity';
import { Model } from 'mongoose';
import FieldType from '../../entities/field-type.entity';

@Injectable()
export default class FindFieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) {}

  async findById(fieldId: string): Promise<FindFieldDto> {
    const field = await this.fieldModel.findById(fieldId).populate<{ type: FieldType }>(FieldType.name).exec();

    if (!field) throw new NotFoundException(`Field with id: ${fieldId} not found!`);

    return new FindFieldDto(field);
  }
}
