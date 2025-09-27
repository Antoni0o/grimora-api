import { Types } from 'mongoose';
import { FieldMongoSchema, TemplateDocument } from './template.schema';
import { Template } from '../domain/entities/template.entity';
import { Field } from '../domain/entities/fields/field.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { FieldData } from '../domain/interfaces/field.interface';
import { Position } from '../domain/entities/position.entity';

export class TemplateMapper {
  static templateToDomain(document: TemplateDocument): Template {
    return new Template(
      document._id.toString(),
      document.title,
      document.fields?.map(field => TemplateMapper.fieldToDomain(field)) || [],
      document.usedPositions?.map(pos => new Position(pos.row, pos.col)) || [],
    );
  }

  static fieldToDomain(fieldSchema: FieldMongoSchema): Field {
    const fieldData = TemplateMapper.toFieldData(fieldSchema);

    return FieldFactory.create(fieldData);
  }

  static toFieldData(fieldSchema: FieldMongoSchema): FieldData {
    return <FieldData>{
      id: fieldSchema._id.toString(),
      title: fieldSchema.title,
      type: fieldSchema.type,
      fields: fieldSchema.fields ? fieldSchema.fields.map(child => this.toFieldData(child)) : [],
      key: fieldSchema.key,
      value: fieldSchema.value,
      resourceId: fieldSchema.resourceId,
      positions: fieldSchema.positions?.map(pos => new Position(pos.row, pos.col)) || [],
    };
  }

  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
