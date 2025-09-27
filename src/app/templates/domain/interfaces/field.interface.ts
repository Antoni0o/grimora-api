import { FieldType } from '../enums/field-type.enum';
import { Position } from '../entities/position.entity';

export interface FieldData {
  id: string;
  title: string;
  type: FieldType;
  fields?: FieldData[];
  key?: string;
  value?: string;
  resourceId?: string;
  positions: Position[];
}
