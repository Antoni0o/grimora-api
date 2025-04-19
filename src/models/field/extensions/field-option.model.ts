import BaseFieldModel from '../field.model';

export default class FieldOptionModel extends BaseFieldModel {
  public selected: boolean = false;

  constructor(
    id: string,
    key: string,
    name: string,
    readonly: boolean,
    required: boolean,
    hidden: boolean,
    selected: boolean,
  ) {
    super(id, key, name, readonly, required, hidden);

    this.selected = selected;
  }

  clone(): BaseFieldModel {
    return new FieldOptionModel(this.id, this.key, this.name, this.readonly, this.required, this.hidden, this.selected);
  }
}
