import { IsArray, IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsMongoId()
  templateId: string;

  @IsArray()
  @IsMongoId({ each: true })
  resourceIds: string[];

  @IsString()
  @IsUUID()
  creatorId: string;

  constructor(title?: string, templateId?: string, resourceIds?: string[], creatorId?: string) {
    this.title = title ?? '';
    this.creatorId = creatorId ?? '';
    this.resourceIds = resourceIds ?? [];
    this.templateId = templateId ?? '';
  }
}
