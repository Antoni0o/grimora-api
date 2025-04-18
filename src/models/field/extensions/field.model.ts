import BaseFieldModel from '../field.model';

export default class FieldModel extends BaseFieldModel {
  constructor(id: string, key: string, name: string, isReadonly: boolean, isRequired: boolean, isHidden: boolean) {
    super(id, key, name, isReadonly, isRequired, isHidden);
  }

  clone(): FieldModel {
    return new FieldModel(this.id, this.key, this.name, this.readonly, this.required, this.hidden);
  }
}
