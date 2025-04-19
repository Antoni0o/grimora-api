import BaseFieldModel from '../field.model';

export default class FieldModel extends BaseFieldModel {
  constructor(id: string, key: string, name: string, readonly: boolean, required: boolean, hidden: boolean) {
    super(id, key, name, readonly, required, hidden);
  }

  clone(): FieldModel {
    return new FieldModel(this.id, this.key, this.name, this.readonly, this.required, this.hidden);
  }
}
