import { FieldFactory } from './field.factory';
import { FieldData } from '../interfaces/field.interface';
import { FieldType } from '../enums/field-type.enum';
import { NumberField } from '../entities/fields/number-field.entity';
import { GroupField } from '../entities/fields/group-field.entity';
import { Position } from '../entities/position.entity';

describe('FieldFactory', () => {
  it('should create a field of the correct type', () => {
    const fieldData: FieldData = {
      id: '1',
      title: 'Char Age',
      type: FieldType.NUMBER,
      positions: [new Position(1, 1)],
    };

    const field = FieldFactory.create(fieldData);

    expect(field).toBeDefined();

    expect(field.id).toBe('1');
    expect(field.title).toBe(fieldData.title);
    expect(field.type).toBe(FieldType.NUMBER);

    expect(field).toBeInstanceOf(NumberField);
    expect(field.positions).toEqual([expect.objectContaining({ row: 1, col: 1 })]);
  });

  it('should create a group field of the correct type', () => {
    const fieldData: FieldData = {
      id: 'group1',
      title: 'Char Information',
      type: FieldType.GROUP,
      positions: [new Position(1, 1)],
      fields: [
        {
          id: 'field1',
          title: 'Char Age',
          type: FieldType.NUMBER,
          positions: [new Position(2, 2)],
        },
      ],
    };

    const field = FieldFactory.create(fieldData);

    expect(field).toBeDefined();

    expect(field).toBeInstanceOf(GroupField);
    expect(field.id).toBe('group1');
    expect(field.type).toBe(FieldType.GROUP);
    expect(field.positions).toEqual([expect.objectContaining({ row: 1, col: 1 })]);

    const groupField = field as GroupField;
    expect(groupField.fields).toHaveLength(1);

    const childField = groupField.fields[0];
    expect(childField).toBeInstanceOf(NumberField);
    expect(childField.id).toBe('field1');
    expect(childField.type).toBe(FieldType.NUMBER);
    expect(childField.positions).toEqual([expect.objectContaining({ row: 2, col: 2 })]);
  });
});
