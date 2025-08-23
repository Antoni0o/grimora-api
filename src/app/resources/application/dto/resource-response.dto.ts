import { ResourceItemResponseDto } from './resource-item-response.dto';

export class ResourceResponseDto {
  id: string;
  name: string;
  items: ResourceItemResponseDto[];

  constructor(id: string, name: string, items: ResourceItemResponseDto[]) {
    this.id = id;
    this.name = name;
    this.items = items;
  }
}
