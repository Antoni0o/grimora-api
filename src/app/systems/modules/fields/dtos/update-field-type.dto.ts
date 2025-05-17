import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import FieldType from '../../field-types/field-type.entity';

export default class UpdateFieldTypeDto {
  @IsString()
  @IsOptional()
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
