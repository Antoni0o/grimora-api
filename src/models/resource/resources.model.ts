import ResourceModel from './resource.model';

export default class ResourcesModel {
  public id: string;
  public name: string;
  public key: string;
  public resources: ResourceModel[];

  constructor(id: string, name: string, key: string, resources: ResourceModel[]) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.resources = resources;
  }
}
