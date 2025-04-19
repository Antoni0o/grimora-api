import BaseFieldModel from '../field.model';

export default class FieldGroupModel extends BaseFieldModel {
  public children: BaseFieldModel[];

  constructor(
    id: string,
    key: string,
    name: string,
    readonly: boolean,
    required: boolean,
    hidden: boolean,
    children: BaseFieldModel[] = [],
  ) {
    super(id, key, name, readonly, required, hidden);

    this.children = children;
  }

  clone(): FieldGroupModel {
    return new FieldGroupModel(
      this.id,
      this.key,
      this.name,
      this.readonly,
      this.required,
      this.hidden,
      this.children.map(child => child.clone()),
    );
  }
}
