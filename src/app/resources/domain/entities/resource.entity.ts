import { ResourceItem } from './resource-item.entity';

export class Resource {
  id: string;
  name: string;
  items: ResourceItem[];

  constructor(id: string, name: string, items: ResourceItem[]) {
    this.id = id;
    this.name = name;
    this.items = items;
  }
}
