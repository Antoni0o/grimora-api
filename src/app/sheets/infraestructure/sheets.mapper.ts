import { SheetDocument } from './sheets.schema';
import { Sheet } from '../domain/entities/sheet.entity';
import { Template } from 'src/app/templates/domain/entities/template.entity';
import { Types } from 'mongoose';
import { FieldMongoSchema, TemplateDocument } from 'src/app/templates/infraestructure/template.schema';
import { FieldFactory } from 'src/app/templates/domain/factories/field.factory';
import { FieldData } from 'src/app/templates/domain/interfaces/field.interface';
import { Position } from 'src/app/templates/domain/entities/position.entity';

export class SheetsMapper {
  static toDomain(document: SheetDocument): Sheet {
    return new Sheet(
      document._id.toString(),
      document.title,
      document.ownerId,
      this.mapTemplate(document.template),
      document.values,
    );
  }

  private static mapTemplate(template: Types.ObjectId | TemplateDocument) {
    if (template instanceof Types.ObjectId) {
      return new Template(template.toHexString(), '', [], []);
    } else {
      return new Template(
        template._id?.toString?.() ?? '',
        template.title ?? '',
        template.fields?.map(field => {
          const fieldData: FieldData = SheetsMapper.mapToFieldData(field);

          return FieldFactory.create(fieldData);
        }) || [],
        template.usedPositions?.map(pos => new Position(pos.row, pos.col)) || [],
      );
    }
  }

  private static mapToFieldData(field: FieldMongoSchema): FieldData {
    return {
      id: field._id?.toString?.() ?? '',
      type: field.type,
      title: field.title,
      fields: field.fields?.map(child => SheetsMapper.mapToFieldData(child)),
      key: field.key || undefined,
      value: field.value || undefined,
      resourceId: field.resourceId || undefined,
      positions: field.positions?.map(pos => new Position(pos.row, pos.col)) || [],
    };
  }
}
