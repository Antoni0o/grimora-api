import FieldModel from '../field.model';

export default class FieldGroupModel extends FieldModel {
  public children: FieldModel[];

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    children: FieldModel[] = [],
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.children = children;
  }
}
