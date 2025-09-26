import { FieldType } from '../enums/field-type.enum';
import { FieldData } from '../interfaces/field.interface';
import { Template } from './template.entity';

describe('TemplateEntity', () => {
  let template: Template;

  beforeEach(() => {
    template = new Template('id', 'title', [], [], []);
  });

  describe('addField', () => {
    it('should add a new field', () => {
      const field = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1],
        rows: [1],
      });

      expect(field).toBeDefined();
      expect(template.fields.length).toBe(1);
      expect(template.usedColumns).toContain(1);
      expect(template.usedRows).toContain(1);
    });

    it('should not add a field if columns exceed limit', () => {
      const field = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1, 2, 3, 4, 5, 6, 7],
        rows: [1],
      });

      expect(field).toBeNull();
      expect(template.fields.length).toBe(0);
    });

    it('should not add a field if rows exceed limit', () => {
      const field = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1],
        rows: [15, 16, 17, 18, 19, 20, 21],
      });

      expect(field).toBeNull();
      expect(template.fields.length).toBe(0);
    });
  });

  describe('updateField', () => {
    it('should update an existing field', () => {
      const addedField = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1],
        rows: [1],
      });

      expect(addedField).toBeDefined();

      const fieldData = <FieldData>{
        title: 'Updated Title',
        type: FieldType.NUMBER,
        columns: [2],
        rows: [2],
      };

      const updatedField = template.updateField(addedField!.id, fieldData);

      expect(updatedField).toBeDefined();
      expect(updatedField!.title).toBe('Updated Title');
      expect(updatedField!.type).toBe(FieldType.NUMBER);
      expect(template.usedColumns).toContain(2);
      expect(template.usedRows).toContain(2);
      expect(template.usedColumns).not.toContain(1);
      expect(template.usedRows).not.toContain(1);
    });

    it('should not update a non-existing field', () => {
      const fieldData = <FieldData>{
        title: 'Updated Title',
        type: FieldType.NUMBER,
        columns: [2],
        rows: [2],
      };

      const updatedField = template.updateField('nonExistingId', fieldData);

      expect(updatedField).toBeNull();
    });

    it('should not update if new columns exceed limit', () => {
      const addedField = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1],
        rows: [1],
      });

      expect(addedField).toBeDefined();

      const fieldData = <FieldData>{
        title: 'Updated Title',
        type: FieldType.NUMBER,
        columns: [1, 2, 3, 4, 5, 6, 7],
        rows: [2],
      };

      const updatedField = template.updateField(addedField!.id, fieldData);

      expect(updatedField).toBeNull();
      expect(template.usedColumns).toContain(1);
      expect(template.usedRows).toContain(1);
    });

    it('should not update if new rows exceed limit', () => {
      const addedField = template.addField({
        id: 'fieldId',
        title: 'Field Title',
        type: FieldType.TEXT,
        columns: [1],
        rows: [1],
      });

      expect(addedField).toBeDefined();

      const fieldData = <FieldData>{
        title: 'Updated Title',
        type: FieldType.NUMBER,
        columns: [2],
        rows: [14, 15, 16, 17, 18, 19, 20, 21],
      };

      const updatedField = template.updateField(addedField!.id, fieldData);

      expect(updatedField).toBeNull();
      expect(template.usedColumns).toContain(1);
      expect(template.usedRows).toContain(1);
    });
  });

  it('should not add an used row bigger than limit', () => {
    const newUsedRows = [1, 2, 3, 21];

    const response = template.addUsedRows(newUsedRows, FieldType.TEXT);

    expect(response).toBe(null);
  });

  it('should not add an used row that is already in use', () => {
    template.usedRows = [1, 2, 3];
    const newUsedRows = [3, 4, 5];

    const response = template.addUsedRows(newUsedRows, FieldType.TEXT);

    expect(response).toBe(null);
  });

  it('should not add an used column bigger than limit', () => {
    const newUsedColumns = [1, 2, 7];

    const response = template.addUsedColumns(newUsedColumns, FieldType.TEXT);

    expect(response).toBe(null);
  });

  it('should not add an used column that is already in use', () => {
    template.usedColumns = [1, 2, 3];
    const newUsedColumns = [3, 4, 5];

    const response = template.addUsedColumns(newUsedColumns, FieldType.TEXT);

    expect(response).toBe(null);
  });
});
