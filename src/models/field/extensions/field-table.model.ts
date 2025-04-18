import BaseFieldModel from '../field.model';
import FieldModel from './field.model';

export default class FieldTableModel<T = any> extends BaseFieldModel {
  rows: T[];
  columns: BaseFieldModel[];

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

  clone(): BaseFieldModel {
    return new FieldTableModel(
      this.id,
      this.key,
      this.name,
      this.readonly,
      this.required,
      this.hidden,
      this.columns.map(column => column.clone()),
      [...this.rows],
    );
  }
}
