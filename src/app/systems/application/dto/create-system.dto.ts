import { IsArray, IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  templateIds: string[];

  @IsArray()
  @IsMongoId({ each: true })
  resourceIds: string[];

  @IsString()
  @IsUUID()
  creatorId: string;

  constructor(title?: string, templateIds?: string[], resourceIds?: string[], creatorId?: string) {
    this.title = title ?? '';
    this.creatorId = creatorId ?? '';
    this.resourceIds = resourceIds ?? [];
    this.templateIds = templateIds ?? [];
  }
}
