import { FieldType } from '../enums/field-type.enum';
import { FieldData } from '../interfaces/field.interface';
import { Template } from './template.entity';
import { TemplateDomainError } from '../types/template-domain-result.types';

// --- Test Data Builders ---

const createFieldData = (
  id: string,
  type: FieldType,
  columns: number[],
  rows: number[],
  title: string = 'Field',
  fields?: FieldData[],
): FieldData => ({
  id,
  title: `${title} ${id}`,
  type,
  columns,
  rows,
  fields,
});

const createTextField = (id: string, columns: number[], rows: number[]): FieldData =>
  createFieldData(id, FieldType.TEXT, columns, rows, 'Text Field');

const createNumberField = (id: string, columns: number[], rows: number[]): FieldData =>
  createFieldData(id, FieldType.NUMBER, columns, rows, 'Number Field');

const createGroupField = (id: string, fields: FieldData[]): FieldData =>
  createFieldData(id, FieldType.GROUP, [], [], 'Group Field', fields);

describe('TemplateEntity', () => {
  let template: Template;

  beforeEach(() => {
    template = new Template('template-id', 'Test Template');
  });

  describe('Field Addition', () => {
    it('should add a common field successfully', () => {
      const field = createTextField('field1', [1], [1]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(result.field).toBeDefined();
      expect(template.fields.length).toBe(1);
      expect(template.usedColumns).toContain(1);
      expect(template.usedRows).toContain(1);
    });

    it('should fail if column limit is exceeded', () => {
      const field = createTextField('field1', [100], [1]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
      expect(result.field).toBeUndefined();
    });

    it('should fail if row limit is exceeded', () => {
      const field = createTextField('field1', [1], [100]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.RowLimitExceeded);
      expect(result.field).toBeUndefined();
    });

    it('should fail on slot conflict with another common field', () => {
      template.addField(createTextField('f1', [1], [1]));
      const result = template.addField(createTextField('f2', [1], [2]));

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
      expect(result.field).toBeUndefined();
    });

    it('should add a group and occupy slots of its children', () => {
      const group = createGroupField('g1', [createTextField('f1', [2], [2]), createNumberField('f2', [3], [3])]);
      const result = template.addField(group);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedColumns).toEqual(expect.arrayContaining([2, 3]));
      expect(template.usedRows).toEqual(expect.arrayContaining([2, 3]));
    });

    it('should fail if a group child conflicts with an existing field', () => {
      template.addField(createTextField('existing', [4], [4]));
      const group = createGroupField('g1', [createTextField('conflicting', [4], [5])]);
      const result = template.addField(group);

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
    });
  });

  describe('Field Update', () => {
    beforeEach(() => {
      template.addField(createTextField('field1', [1], [1]));
    });

    it('should update an existing field successfully', () => {
      const updatedFieldData = createNumberField('field1', [2], [2]);
      const result = template.updateField('field1', updatedFieldData);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(result.field?.title).toBe(updatedFieldData.title);
      expect(result.field?.type).toBe(FieldType.NUMBER);
      expect(template.usedColumns).toEqual([2]);
      expect(template.usedRows).toEqual([2]);
    });

    it('should fail to update a non-existent field', () => {
      const result = template.updateField('non-existent', createTextField('any', [2], [2]));

      expect(result.error).toBe(TemplateDomainError.FieldNotFound);
    });

    it('should fail if updated field exceeds column limit', () => {
      const result = template.updateField('field1', createTextField('field1', [100], [2]));

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
      expect(template.usedColumns).toEqual([1]);
    });

    it('should fail if updated field exceeds row limit', () => {
      const result = template.updateField('field1', createTextField('field1', [2], [100]));

      expect(result.error).toBe(TemplateDomainError.RowLimitExceeded);
      expect(template.usedRows).toEqual([1]);
    });
  });

  describe('Nested Group Validation', () => {
    it('should add a group with nested children and occupy all slots', () => {
      const nestedGroup = createGroupField('parent-group', [
        createTextField('parent-field', [1], [1]),
        createGroupField('child-group', [
          createTextField('nested-field-1', [2], [2]),
          createNumberField('nested-field-2', [3], [3]),
        ]),
      ]);
      const result = template.addField(nestedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedColumns).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(template.usedRows).toEqual(expect.arrayContaining([1, 2, 3]));
    });

    it('should fail if a deeply nested child conflicts with an existing field', () => {
      template.addField(createTextField('existing', [2], [2]));
      const nestedGroup = createGroupField('parent-group', [
        createGroupField('child-group', [createTextField('conflicting', [2], [4])]),
      ]);
      const result = template.addField(nestedGroup);

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
    });

    it('should handle multiple levels of nesting correctly', () => {
      const deeplyNestedGroup = createGroupField('level-1', [
        createGroupField('level-2', [createGroupField('level-3', [createTextField('deep-field', [4], [7])])]),
      ]);
      const result = template.addField(deeplyNestedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedColumns).toContain(4);
      expect(template.usedRows).toContain(7);
    });

    it('should fail if a nested child exceeds column limits', () => {
      const invalidGroup = createGroupField('parent', [
        createGroupField('child', [createTextField('invalid', [100], [1])]),
      ]);
      const result = template.addField(invalidGroup);

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
    });

    it('should handle a mix of common fields and nested groups', () => {
      const mixedGroup = createGroupField('mixed-group', [
        createTextField('common-field', [5], [8]),
        createGroupField('nested-group', [createNumberField('nested-field', [6], [9])]),
      ]);
      const result = template.addField(mixedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedColumns).toEqual(expect.arrayContaining([5, 6]));
      expect(template.usedRows).toEqual(expect.arrayContaining([8, 9]));
    });
  });
});
