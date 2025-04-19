import BaseFieldWithValueModel from '../field-with-value.model';

export default class FieldNumberModel extends BaseFieldWithValueModel<number> {
  public defaultValue?: number;

  constructor(
    id: string,
    key: string,
    name: string,
    readonly: boolean,
    required: boolean,
    hidden: boolean,
    value: number = 0,
    defaultValue?: number,
  ) {
    super(id, key, name, readonly, required, hidden, value);

    this.defaultValue = defaultValue;
  }

  clone(): FieldNumberModel {
    return new FieldNumberModel(
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
