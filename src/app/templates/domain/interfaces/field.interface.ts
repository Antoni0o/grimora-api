import { FieldType } from '../enums/field-type.enum';

export interface FieldData {
  id: string;
  title: string;
  type: FieldType;
  fields?: FieldData[];
  key?: string;
  value?: string;
  resourceId?: string;
  columns: number[];
  rows: number[];
}
