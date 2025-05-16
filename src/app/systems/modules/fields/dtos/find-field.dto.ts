import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import Field from '../field.entity';

export default class FindFieldDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  typeKey!: string;

  @IsOptional()
  config?: object;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  readonly?: boolean;

  @IsOptional()
  children?: FindFieldDto[];

  @IsOptional()
  value?: string | number;

  constructor(field: Partial<Field>) {
    if (field) {
      this.name = field.name!;
      this.description = field.description;
      this.typeKey = field.type!.key;
      this.config = field.config;
      this.required = field.required;
      this.readonly = field.readonly;
      this.children = field.children?.map(child => new FindFieldDto(child));
      this.value = field.value;
    }
  }
}
