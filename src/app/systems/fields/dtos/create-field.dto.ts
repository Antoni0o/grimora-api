import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export default class CreateFieldDto {
  @IsOptional()
  _id?: Types.ObjectId;

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
  config?: object;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  readonly?: boolean;

  @IsOptional()
  children?: CreateFieldDto[];

  @IsOptional()
  value?: string | number;
}
