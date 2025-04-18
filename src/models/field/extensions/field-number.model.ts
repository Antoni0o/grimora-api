import FieldModel from '../field.model';

export default class FieldNumberModel extends FieldModel {
  public value: number;
  public defaultValue?: number;

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    value: number = 0,
    defaultValue?: number,
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.value = value;
    this.defaultValue = defaultValue;
  }
}
