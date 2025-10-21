import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  templateIds: string[];

  @IsArray()
  @IsMongoId({ each: true })
  resourceIds: string[];

  @IsString()
  creatorId: string;

  constructor(
    title?: string,
    description?: string,
    templateIds?: string[],
    resourceIds?: string[],
    creatorId?: string,
  ) {
    this.title = title ?? '';
    this.description = description ?? '';
    this.creatorId = creatorId ?? '';
    this.resourceIds = resourceIds ?? [];
    this.templateIds = templateIds ?? [];
  }
}
