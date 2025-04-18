import BaseFieldWithValueModel from '../field-with-value.model';

export default class FieldTextModel extends BaseFieldWithValueModel<string> {
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
    super(id, key, name, isReadonly, isRequired, isHidden, value);

    this.defaultValue = defaultValue;
  }

  clone(): FieldTextModel {
    return new FieldTextModel(
      this.id,
      this.key,
      this.name,
      this.readonly,
      this.required,
      this.hidden,
      this.value,
      this.defaultValue,
    );
  }
}
