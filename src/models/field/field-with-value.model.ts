import BaseFieldModel from './field.model';

export default abstract class BaseFieldWithValueModel<T> extends BaseFieldModel {
  constructor(
    public id: string,
    public key: string,
    public name: string,
    public readonly: boolean,
    public required: boolean,
    public hidden: boolean,
    public value: T,
  ) {
    super(id, key, name, readonly, required, hidden);
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    if (!this.readonly) {
      this.value = value;
    }
  }
}
