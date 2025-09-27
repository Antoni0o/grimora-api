import { FieldType } from '../enums/field-type.enum';
import { FieldData } from '../interfaces/field.interface';
import { Template } from './template.entity';
import { TemplateDomainError } from '../types/template-domain-result.types';
import { Position } from './position.entity';

const createFieldData = (
  id: string,
  type: FieldType,
  positions: Position[],
  title: string = 'Field',
  fields?: FieldData[],
): FieldData => ({
  id,
  title: `${title} ${id}`,
  type,
  positions,
  fields,
});

const createTextField = (id: string, positions: Position[]): FieldData =>
  createFieldData(id, FieldType.TEXT, positions, 'Text Field');

const createNumberField = (id: string, positions: Position[]): FieldData =>
  createFieldData(id, FieldType.NUMBER, positions, 'Number Field');

const createGroupField = (id: string, fields: FieldData[]): FieldData =>
  createFieldData(id, FieldType.GROUP, [], 'Group Field', fields);

describe('TemplateEntity', () => {
  let template: Template;

  beforeEach(() => {
    template = new Template('template-id', 'Test Template');
  });

  describe('Field Addition', () => {
    it('should add a common field successfully', () => {
      const field = createTextField('field1', [new Position(1, 1)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(result.field).toBeDefined();
      expect(template.fields.length).toBe(1);
      expect(template.usedPositions).toEqual(expect.arrayContaining([expect.objectContaining({ row: 1, col: 1 })]));
    });

    it('should fail if column limit is exceeded', () => {
      const field = createTextField('field1', [new Position(1, 100)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
      expect(result.field).toBeUndefined();
    });

    it('should fail if row limit is exceeded', () => {
      const field = createTextField('field1', [new Position(100, 1)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.RowLimitExceeded);
      expect(result.field).toBeUndefined();
    });

    it('should fail on position conflict with another common field', () => {
      template.addField(createTextField('f1', [new Position(1, 1)]));
      const result = template.addField(createTextField('f2', [new Position(1, 1)]));

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
      expect(result.field).toBeUndefined();
    });

    it('should add a group and occupy positions of its children', () => {
      const group = createGroupField('g1', [
        createTextField('f1', [new Position(2, 2)]),
        createNumberField('f2', [new Position(3, 3)]),
      ]);
      const result = template.addField(group);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 2, col: 2 }),
          expect.objectContaining({ row: 3, col: 3 }),
        ]),
      );
    });

    it('should fail if a group child conflicts with an existing field', () => {
      template.addField(createTextField('existing', [new Position(4, 4)]));
      const group = createGroupField('g1', [createTextField('conflicting', [new Position(4, 4)])]);
      const result = template.addField(group);

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
    });

    it('should allow multiple positions for the same field', () => {
      const field = createTextField('field1', [new Position(1, 1), new Position(1, 2), new Position(2, 1)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedPositions.length).toBe(3);
      expect(template.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 1, col: 2 }),
          expect.objectContaining({ row: 2, col: 1 }),
        ]),
      );
    });
  });

  describe('Field Update', () => {
    beforeEach(() => {
      template.addField(createTextField('field1', [new Position(1, 1)]));
    });

    it('should update an existing field successfully', () => {
      const updatedFieldData = createNumberField('field1', [new Position(2, 2)]);
      const result = template.updateField('field1', updatedFieldData);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(result.field?.title).toBe(updatedFieldData.title);
      expect(result.field?.type).toBe(FieldType.NUMBER);
      expect(template.usedPositions).toEqual([expect.objectContaining({ row: 2, col: 2 })]);
    });

    it('should fail to update a non-existent field', () => {
      const result = template.updateField('non-existent', createTextField('any', [new Position(2, 2)]));

      expect(result.error).toBe(TemplateDomainError.FieldNotFound);
    });

    it('should fail if updated field exceeds column limit', () => {
      const result = template.updateField('field1', createTextField('field1', [new Position(2, 100)]));

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
      expect(template.usedPositions).toEqual([expect.objectContaining({ row: 1, col: 1 })]);
    });

    it('should fail if updated field exceeds row limit', () => {
      const result = template.updateField('field1', createTextField('field1', [new Position(100, 2)]));

      expect(result.error).toBe(TemplateDomainError.RowLimitExceeded);
      expect(template.usedPositions).toEqual([expect.objectContaining({ row: 1, col: 1 })]);
    });
  });

  describe('Nested Group Validation', () => {
    it('should add a group with nested children and occupy all positions', () => {
      const nestedGroup = createGroupField('parent-group', [
        createTextField('parent-field', [new Position(1, 1)]),
        createGroupField('child-group', [
          createTextField('nested-field-1', [new Position(2, 2)]),
          createNumberField('nested-field-2', [new Position(3, 3)]),
        ]),
      ]);
      const result = template.addField(nestedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 1, col: 1 }),
          expect.objectContaining({ row: 2, col: 2 }),
          expect.objectContaining({ row: 3, col: 3 }),
        ]),
      );
    });

    it('should fail if a deeply nested child conflicts with an existing field', () => {
      template.addField(createTextField('existing', [new Position(2, 2)]));
      const nestedGroup = createGroupField('parent-group', [
        createGroupField('child-group', [createTextField('conflicting', [new Position(2, 2)])]),
      ]);
      const result = template.addField(nestedGroup);

      expect(result.error).toBe(TemplateDomainError.CommonFieldSlotConflict);
    });

    it('should handle multiple levels of nesting correctly', () => {
      const deeplyNestedGroup = createGroupField('level-1', [
        createGroupField('level-2', [
          createGroupField('level-3', [createTextField('deep-field', [new Position(4, 4)])]),
        ]),
      ]);
      const result = template.addField(deeplyNestedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedPositions).toEqual(expect.arrayContaining([expect.objectContaining({ row: 4, col: 4 })]));
    });

    it('should fail if a nested child exceeds column limits', () => {
      const invalidGroup = createGroupField('parent', [
        createGroupField('child', [createTextField('invalid', [new Position(1, 100)])]),
      ]);
      const result = template.addField(invalidGroup);

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
    });

    it('should handle a mix of common fields and nested groups', () => {
      const mixedGroup = createGroupField('mixed-group', [
        createTextField('common-field', [new Position(5, 5)]),
        createGroupField('nested-group', [createNumberField('nested-field', [new Position(6, 6)])]),
      ]);
      const result = template.addField(mixedGroup);

      expect(result.error).toBe(TemplateDomainError.None);
      expect(template.usedPositions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ row: 5, col: 5 }),
          expect.objectContaining({ row: 6, col: 6 }),
        ]),
      );
    });
  });

  describe('Position Validation', () => {
    it('should fail if position has row less than 1', () => {
      const field = createTextField('field1', [new Position(0, 1)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.RowLimitExceeded);
    });

    it('should fail if position has column less than 1', () => {
      const field = createTextField('field1', [new Position(1, 0)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.ColumnLimitExceeded);
    });

    it('should allow positions at grid boundaries', () => {
      const field = createTextField('field1', [new Position(20, 6)]);
      const result = template.addField(field);

      expect(result.error).toBe(TemplateDomainError.None);
    });
  });
});
