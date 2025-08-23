import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResourceItemRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsNotEmpty()
  props: Record<string, unknown>;

  constructor(name: string, description: string, props: Record<string, unknown>) {
    this.name = name;
    this.description = description;
    this.props = props;
  }
}
