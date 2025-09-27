import { COLUMNS_LIMIT, ROWS_LIMIT } from '../constants/template.constants';
import { FieldType } from '../enums/field-type.enum';
import { FieldFactory } from '../factories/field.factory';
import { FieldData } from '../interfaces/field.interface';
import { TemplateDomainError, TemplateDomainResult, SlotValidationResult } from '../types/template-domain-result.types';
import { Field } from './fields/field.entity';
import { GroupField } from './fields/group-field.entity';

export class Template {
  readonly id: string;
  readonly title: string;
  private _fields: Field[] = [];
  private _usedColumns: number[] = [];
  private _usedRows: number[] = [];

  constructor(id: string, title: string, fields: Field[] = [], usedColumns: number[] = [], usedRows: number[] = []) {
    this.id = id;
    this.title = title;
    this._fields = fields;
    this._usedColumns = usedColumns;
    this._usedRows = usedRows;
  }

  get fields(): Field[] {
    return [...this._fields];
  }

  get usedColumns(): number[] {
    return [...this._usedColumns];
  }

  get usedRows(): number[] {
    return [...this._usedRows];
  }

  addField(fieldData: FieldData): TemplateDomainResult {
    const validationResult = this.validateFieldSlots(fieldData);
    if (validationResult.error !== TemplateDomainError.None) {
      return { error: validationResult.error };
    }

    this.occupyFieldSlots(fieldData, validationResult.occupiedSlots!);
    const createdField = FieldFactory.create(fieldData);
    this._fields.push(createdField);

    return { error: TemplateDomainError.None, field: createdField };
  }

  updateField(fieldId: string, newFieldData: FieldData): TemplateDomainResult {
    const existingField = this.findFieldById(fieldId);
    if (!existingField) {
      return { error: TemplateDomainError.FieldNotFound };
    }

    const originalSlots = this.getFieldOccupiedSlots(existingField);
    this.freeSlots(originalSlots);

    const validationResult = this.validateFieldSlots(newFieldData, existingField);
    if (validationResult.error !== TemplateDomainError.None) {
      this.occupySlots(originalSlots);
      return { error: validationResult.error };
    }

    this.occupyFieldSlots(newFieldData, validationResult.occupiedSlots!);
    this.updateExistingFieldProperties(existingField, newFieldData);

    return { error: TemplateDomainError.None, field: existingField };
  }

  private validateFieldSlots(fieldData: FieldData, existingField?: Field): SlotValidationResult {
    if (this.isGroupField(fieldData)) {
      return this.validateGroupFieldSlots(fieldData);
    }
    return this.validateCommonFieldSlots(fieldData, existingField);
  }

  private validateGroupFieldSlots(groupData: FieldData): SlotValidationResult {
    if (!groupData.fields) {
      return { error: TemplateDomainError.None, occupiedSlots: [] };
    }

    const allOccupiedSlots: number[] = [];

    for (const childField of groupData.fields) {
      if (this.isGroupField(childField)) {
        const nestedGroupValidation = this.validateGroupFieldSlots(childField);
        if (nestedGroupValidation.error !== TemplateDomainError.None) {
          return { error: nestedGroupValidation.error };
        }
        allOccupiedSlots.push(...nestedGroupValidation.occupiedSlots!);
      } else {
        const columnValidation = this.validateSlotLimitsAndConflicts(childField.columns, true);
        if (columnValidation !== TemplateDomainError.None) {
          return { error: columnValidation };
        }

        const rowValidation = this.validateSlotLimitsAndConflicts(childField.rows, false);
        if (rowValidation !== TemplateDomainError.None) {
          return { error: rowValidation };
        }

        allOccupiedSlots.push(...childField.columns, ...childField.rows);
      }
    }

    return { error: TemplateDomainError.None, occupiedSlots: allOccupiedSlots };
  }

  private validateCommonFieldSlots(fieldData: FieldData, existingField?: Field): SlotValidationResult {
    const columnsToValidate = fieldData.columns || existingField?.columns || [];
    const rowsToValidate = fieldData.rows || existingField?.rows || [];

    const columnValidation = this.validateSlotLimitsAndConflicts(columnsToValidate, true);
    if (columnValidation !== TemplateDomainError.None) {
      return { error: columnValidation };
    }

    const rowValidation = this.validateSlotLimitsAndConflicts(rowsToValidate, false);
    if (rowValidation !== TemplateDomainError.None) {
      return { error: rowValidation };
    }

    return {
      error: TemplateDomainError.None,
      occupiedSlots: [...columnsToValidate, ...rowsToValidate],
    };
  }

  private validateSlotLimitsAndConflicts(slots: number[], isColumn: boolean): TemplateDomainError {
    const limit = isColumn ? COLUMNS_LIMIT : ROWS_LIMIT;
    const usedSlots = isColumn ? this._usedColumns : this._usedRows;

    for (const slot of slots) {
      if (this.exceedsLimit(slot, limit)) {
        return isColumn ? TemplateDomainError.ColumnLimitExceeded : TemplateDomainError.RowLimitExceeded;
      }

      if (this.hasSlotConflict(slot, usedSlots)) {
        return TemplateDomainError.CommonFieldSlotConflict;
      }
    }

    return TemplateDomainError.None;
  }

  private occupyFieldSlots(fieldData: FieldData, occupiedSlots: number[]): void {
    if (this.isGroupField(fieldData) && fieldData.fields) {
      for (const childField of fieldData.fields) {
        if (this.isGroupField(childField)) {
          this.occupyFieldSlots(childField, []);
        } else {
          this._usedColumns.push(...childField.columns);
          this._usedRows.push(...childField.rows);
        }
      }
    } else {
      this._usedColumns.push(...fieldData.columns);
      this._usedRows.push(...fieldData.rows);
    }
  }

  private occupySlots(slots: { columns: number[]; rows: number[] }): void {
    this._usedColumns.push(...slots.columns);
    this._usedRows.push(...slots.rows);
  }

  private freeSlots(slots: { columns: number[]; rows: number[] }): void {
    this._usedColumns = this._usedColumns.filter(col => !slots.columns.includes(col));
    this._usedRows = this._usedRows.filter(row => !slots.rows.includes(row));
  }

  private findFieldById(fieldId: string): Field | undefined {
    return this._fields.find(field => field.id === fieldId);
  }

  private getFieldOccupiedSlots(field: Field): { columns: number[]; rows: number[] } {
    return {
      columns: [...field.columns],
      rows: [...field.rows],
    };
  }

  private updateExistingFieldProperties(existingField: Field, newData: FieldData): void {
    existingField.title = newData.title || existingField.title;
    existingField.type = newData.type || existingField.type;

    if (this.isGroupField(newData) && newData.fields && this.isGroupFieldEntity(existingField)) {
      existingField.fields = newData.fields.map(fieldData => FieldFactory.create(fieldData));
    }
  }

  private isGroupField(fieldData: FieldData): boolean {
    return fieldData.type === FieldType.GROUP;
  }

  private isGroupFieldEntity(field: Field): field is GroupField {
    return field.type === FieldType.GROUP;
  }

  private exceedsLimit(slot: number, limit: number): boolean {
    return slot > limit;
  }

  private hasSlotConflict(slot: number, usedSlots: number[]): boolean {
    return usedSlots.includes(slot);
  }
}
