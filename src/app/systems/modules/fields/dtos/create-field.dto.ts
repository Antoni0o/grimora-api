import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class CreateFieldDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  typeId!: string;

  @IsOptional()
  config?: Record<string, string>;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  readonly?: boolean;

  @IsOptional()
  children?: CreateFieldDto[];

  @IsOptional()
  value?: string | number;
}
