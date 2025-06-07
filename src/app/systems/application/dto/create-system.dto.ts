import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  templateId: string;

  @IsArray()
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
