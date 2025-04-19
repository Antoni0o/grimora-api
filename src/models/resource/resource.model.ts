import BaseFieldModel from '../field/field.model';

export default class ResourceModel {
  public id: string;
  public name: string;
  public key: string;
  public fields: BaseFieldModel[];

  constructor(id: string, name: string, key: string, fields: BaseFieldModel[]) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.fields = fields;
  }
}
