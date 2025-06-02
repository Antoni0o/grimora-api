import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SystemResponseDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUUID()
  @IsNotEmpty()
  templateId!: string;

  @IsArray()
  resourceIds: string[] = [];
}
