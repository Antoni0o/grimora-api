import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResourceItemRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  props: Record<string, unknown>;

  constructor(name: string, props: Record<string, unknown>) {
    this.name = name;
    this.props = props;
  }
}
