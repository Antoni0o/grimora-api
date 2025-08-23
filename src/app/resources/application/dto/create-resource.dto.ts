import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ResourceItemResponseDto } from './resource-item-response.dto';
import { ResourceItemRequestDto } from './resource-item-request.dto';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  items: ResourceItemRequestDto[];

  constructor(name: string, items: ResourceItemResponseDto[]) {
    this.name = name;
    this.items = items;
  }
}
