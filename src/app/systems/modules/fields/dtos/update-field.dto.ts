import { IsOptional, IsString } from 'class-validator';

export default class UpdateFieldDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  typeId?: string;

  @IsOptional()
  config?: object;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  readonly?: boolean;

  @IsOptional()
  value?: string | number;
}
