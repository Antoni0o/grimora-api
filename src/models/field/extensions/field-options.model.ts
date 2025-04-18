import BaseFieldModel from '../field.model';

export default class FieldOptionsModel extends BaseFieldModel {
  public options: string[];

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    options: string[] = [],
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.options = options;
  }

  clone(): BaseFieldModel {
    return new FieldOptionsModel(this.id, this.key, this.name, this.readonly, this.required, this.hidden, [
      ...this.options,
    ]);
  }
}
