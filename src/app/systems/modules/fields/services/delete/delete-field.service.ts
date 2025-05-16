import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Field from '../../field.entity';

@Injectable()
export default class DeleteFieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) {}

  async delete(fieldId: string): Promise<void> {
    const field = await this.fieldModel.findById(fieldId);

    if (!field) throw new NotFoundException('Field not found!');

    field.deleteOne({ _id: fieldId });
  }
}
