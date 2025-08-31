import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SheetDocument, SheetMongoSchema } from './sheets.schema';
import { ISheetsRepository } from '../domain/repositories/sheets.repository.interface';
import { Sheet } from '../domain/entities/sheet.entity';
import { SheetsMapper } from './sheets.mapper';

@Injectable()
export class SheetsRepository implements ISheetsRepository {
  constructor(@InjectModel(SheetMongoSchema.name) private readonly sheetModel: Model<SheetDocument>) {}

  async findById(id: string): Promise<Sheet | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const sheet = await this.sheetModel.findById(id).exec();

    if (!sheet) return null;

    return SheetsMapper.toDomain(sheet);
  }

  async findAll(): Promise<Sheet[] | null> {
    const sheets = await this.sheetModel.find().exec();

    if (!sheets) return null;

    return sheets.map(sheet => SheetsMapper.toDomain(sheet));
  }

  async create(sheet: Sheet): Promise<Sheet | null> {
    const createdSheet = await this.sheetModel.create({
      title: sheet.title,
      ownerId: sheet.ownerId,
      template: sheet.templateId,
      values: sheet.values,
    });

    if (!createdSheet) return null;

    return SheetsMapper.toDomain(createdSheet);
  }

  async update(id: string, sheet: Sheet): Promise<Sheet | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const sheetToUpdate = await this.sheetModel
      .findByIdAndUpdate(
        id,
        {
          title: sheet.title,
          values: sheet.values,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!sheetToUpdate) return null;

    return SheetsMapper.toDomain(sheetToUpdate);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedSheet = await this.sheetModel.findByIdAndDelete(id).exec();

    if (!deletedSheet) return false;

    return true;
  }
}
