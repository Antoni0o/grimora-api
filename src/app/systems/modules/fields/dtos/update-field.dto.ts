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
  config?: Record<string, string>;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  readonly?: boolean;

  @IsOptional()
  value?: string | number;
}
