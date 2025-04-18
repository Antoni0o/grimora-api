import FieldModel from '../field.model';

export default class FieldTableModel<T = any> extends FieldModel {
  rows: T[];
  columns: FieldModel[];

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    columns: FieldModel[] = [],
    rows: T[] = [],
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.rows = rows;
    this.columns = columns;
  }
}
