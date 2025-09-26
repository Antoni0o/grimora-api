import { COLUMNS_LIMIT, ROWS_LIMIT } from '../constants/template.constants';
import { FieldType } from '../enums/field-type.enum';
import { FieldFactory } from '../factories/field.factory';
import { FieldData } from '../interfaces/field.interface';
import { Field } from './fields/field.entity';
import { GroupField } from './fields/group-field.entity';

export class Template {
  id: string;
  title: string;
  fields: Field[];
  usedColumns: number[];
  usedRows: number[];

  constructor(id: string, title: string, fields: Field[] = [], usedColumns: number[] = [], usedRows: number[] = []) {
    this.id = id;
    this.title = title;
    this.fields = fields;
    this.usedColumns = usedColumns;
    this.usedRows = usedRows;
  }

  addField(field: FieldData): Field | null {
    const isColumnsAdded = this.addUsedColumns(field.columns, field.type);
    const isRowsAdded = this.addUsedRows(field.rows, field.type);

    if (!isColumnsAdded || !isRowsAdded) return null;

    const createdField = FieldFactory.create(field);
    this.fields.push(createdField);

    return createdField;
  }

  updateField(fieldId: string, fieldData: FieldData): Field | null {
    const fieldIndex = this.fields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) return null;

    const existingField = this.fields[fieldIndex];

    this.usedColumns = this.usedColumns.filter(col => !existingField.columns.includes(col));
    this.usedRows = this.usedRows.filter(row => !existingField.rows.includes(row));

    const isColumnsAdded = this.addUsedColumns(
      fieldData.columns || existingField.columns,
      fieldData.type || existingField.type,
    );
    const isRowsAdded = this.addUsedRows(fieldData.rows || existingField.rows, fieldData.type || existingField.type);

    if (!isColumnsAdded || !isRowsAdded) {
      this.addUsedColumns(existingField.columns, existingField.type);
      this.addUsedRows(existingField.rows, existingField.type);
      return null;
    }

    existingField.title = fieldData.title || existingField.title;
    existingField.type = fieldData.type || existingField.type;
    if (fieldData.type === FieldType.GROUP && fieldData.fields) {
      (existingField as GroupField).fields = fieldData.fields
        ? fieldData.fields.map(f => FieldFactory.create(f))
        : (existingField as GroupField).fields;
    }

    return existingField;
  }

  addUsedColumns(newUsedColumns: number[], type: FieldType): number[] | null {
    for (let newColumn of newUsedColumns) {
      if (newColumn > COLUMNS_LIMIT) return null;

      if (this.isSlotInUse(this.usedColumns, newColumn, type)) return null;
    }

    this.usedColumns.push(...newUsedColumns);

    return this.usedColumns;
  }

  addUsedRows(usedRows: number[], type: FieldType): number[] | null {
    for (let newRow of usedRows) {
      if (newRow > ROWS_LIMIT) return null;

      if (this.isSlotInUse(this.usedRows, newRow, type)) return null;
    }

    this.usedRows.push(...usedRows);

    return this.usedRows;
  }

  isSlotInUse(usedSlots: number[], newSlot: number, type: FieldType): boolean {
    return type != FieldType.GROUP && usedSlots.some(slot => newSlot == slot);
  }
}
