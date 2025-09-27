import { COLUMNS_LIMIT, ROWS_LIMIT } from '../constants/template.constants';
import { FieldType } from '../enums/field-type.enum';
import { FieldFactory } from '../factories/field.factory';
import { FieldData } from '../interfaces/field.interface';
import { TemplateDomainError, TemplateDomainResult, SlotValidationResult } from '../types/template-domain-result.types';
import { Field } from './fields/field.entity';
import { GroupField } from './fields/group-field.entity';
import { Position } from './position.entity';

export class Template {
  readonly id: string;
  readonly title: string;
  private _fields: Field[] = [];
  private _usedPositions: Position[] = [];

  constructor(id: string, title: string, fields: Field[] = [], usedPositions: Position[] = []) {
    this.id = id;
    this.title = title;
    this._fields = fields;
    this._usedPositions = usedPositions;
  }

  get fields(): Field[] {
    return [...this._fields];
  }

  get usedPositions(): Position[] {
    return [...this._usedPositions];
  }

  addField(fieldData: FieldData): TemplateDomainResult {
    const validationResult = this.validateFieldPositions(fieldData);
    if (validationResult.error !== TemplateDomainError.None) {
      return { error: validationResult.error };
    }

    this.occupyFieldPositions(fieldData);
    const createdField = FieldFactory.create(fieldData);
    this._fields.push(createdField);

    return { error: TemplateDomainError.None, field: createdField };
  }

  updateField(fieldId: string, newFieldData: FieldData): TemplateDomainResult {
    const existingField = this.findFieldById(fieldId);
    if (!existingField) {
      return { error: TemplateDomainError.FieldNotFound };
    }

    const originalPositions = [...existingField.positions];
    this.freePositions(originalPositions);

    const validationResult = this.validateFieldPositions(newFieldData);
    if (validationResult.error !== TemplateDomainError.None) {
      this.occupyPositions(originalPositions);
      return { error: validationResult.error };
    }

    this.occupyFieldPositions(newFieldData);
    this.updateExistingFieldProperties(existingField, newFieldData);

    return { error: TemplateDomainError.None, field: existingField };
  }

  private validateFieldPositions(fieldData: FieldData): SlotValidationResult {
    if (this.isGroupField(fieldData)) {
      return this.validateGroupFieldPositions(fieldData);
    }
    return this.validateCommonFieldPositions(fieldData);
  }

  private validateGroupFieldPositions(groupData: FieldData): SlotValidationResult {
    if (!groupData.fields) {
      return { error: TemplateDomainError.None, occupiedSlots: [] };
    }

    for (const childField of groupData.fields) {
      if (this.isGroupField(childField)) {
        const nestedGroupValidation = this.validateGroupFieldPositions(childField);
        if (nestedGroupValidation.error !== TemplateDomainError.None) {
          return { error: nestedGroupValidation.error };
        }
      } else {
        const positionValidation = this.validatePositions(childField.positions);
        if (positionValidation !== TemplateDomainError.None) {
          return { error: positionValidation };
        }
      }
    }

    return { error: TemplateDomainError.None, occupiedSlots: [] };
  }

  private validateCommonFieldPositions(fieldData: FieldData): SlotValidationResult {
    const positionValidation = this.validatePositions(fieldData.positions);
    if (positionValidation !== TemplateDomainError.None) {
      return { error: positionValidation };
    }

    return { error: TemplateDomainError.None, occupiedSlots: [] };
  }

  private validatePositions(positions: Position[]): TemplateDomainError {
    for (const position of positions) {
      if (this.exceedsRowLimit(position.row)) {
        return TemplateDomainError.RowLimitExceeded;
      }

      if (this.exceedsColumnLimit(position.col)) {
        return TemplateDomainError.ColumnLimitExceeded;
      }

      if (this.hasPositionConflict(position)) {
        return TemplateDomainError.CommonFieldSlotConflict;
      }
    }

    return TemplateDomainError.None;
  }

  private occupyFieldPositions(fieldData: FieldData): void {
    if (this.isGroupField(fieldData) && fieldData.fields) {
      for (const childField of fieldData.fields) {
        if (this.isGroupField(childField)) {
          this.occupyFieldPositions(childField);
        } else {
          this.occupyPositions(childField.positions);
        }
      }
    } else {
      this.occupyPositions(fieldData.positions);
    }
  }

  private occupyPositions(positions: Position[]): void {
    this._usedPositions.push(...positions);
  }

  private freePositions(positions: Position[]): void {
    this._usedPositions = this._usedPositions.filter(usedPos => !positions.some(pos => pos.equals(usedPos)));
  }

  private findFieldById(fieldId: string): Field | undefined {
    return this._fields.find(field => field.id === fieldId);
  }

  private updateExistingFieldProperties(existingField: Field, newData: FieldData): void {
    existingField.title = newData.title || existingField.title;
    existingField.type = newData.type || existingField.type;
    existingField.positions = [...newData.positions];

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

  private exceedsRowLimit(row: number): boolean {
    return row > ROWS_LIMIT || row < 1;
  }

  private exceedsColumnLimit(col: number): boolean {
    return col > COLUMNS_LIMIT || col < 1;
  }

  private hasPositionConflict(position: Position): boolean {
    return this._usedPositions.some(usedPos => usedPos.equals(position));
  }
}
