import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import FieldType from '../entities/field-type.entity';

export default class CreateFieldTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsBoolean()
  @IsOptional()
  default = false;

  @IsOptional()
  @IsObject()
  configSchema?: object;

  constructor(fieldType: Partial<FieldType>) {
    if (fieldType && fieldType.name && fieldType.default) {
      this.name = fieldType.name;
      this.key = fieldType.key;
      this.configSchema = fieldType.configSchema;
      this.default = fieldType.default;
    }
  }
}
