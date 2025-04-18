import FieldModel from '../field.model';

export default class FieldTextModel extends FieldModel {
  public value: string;
  public defaultValue?: string;

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    value: string = '',
    defaultValue?: string,
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.value = value;
    this.defaultValue = defaultValue;
  }
}
