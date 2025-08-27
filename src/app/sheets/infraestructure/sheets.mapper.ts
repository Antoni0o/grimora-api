import { Types } from 'mongoose';
import { SheetDocument } from './sheets.schema';
import { Sheet } from '../domain/entities/sheet.entity';

export class SheetsMapper {
  static toDomain(document: SheetDocument): Sheet {
    return new Sheet(
      document._id.toString(),
      document.title,
      document.ownerId,
      document.template.toString(),
      document.values,
    );
  }
}
