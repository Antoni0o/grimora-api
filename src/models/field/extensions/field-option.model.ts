import FieldModel from '../field.model';

export default class FieldOptionsModel extends FieldModel {
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
}
