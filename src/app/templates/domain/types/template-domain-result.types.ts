import { Field } from '../entities/fields/field.entity';

export enum TemplateDomainError {
  None = 'None',
  ColumnLimitExceeded = 'ColumnLimitExceeded',
  RowLimitExceeded = 'RowLimitExceeded',
  CommonFieldSlotConflict = 'CommonFieldSlotConflict',
  GroupFieldSlotConflict = 'GroupFieldSlotConflict',
  FieldNotFound = 'FieldNotFound',
}

export type TemplateDomainResult<T = Field | null> = {
  error: TemplateDomainError;
  field?: T;
};

export type SlotValidationResult = {
  error: TemplateDomainError;
  occupiedSlots?: number[];
};
