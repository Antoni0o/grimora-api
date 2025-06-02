import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SystemResponseDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  creatorId: string;

  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsArray()
  resourceIds: string[];

  constructor(id: string, title: string, creatorId: string, templateId: string, resourceIds: string[] = []) {
    this.id = id;
    this.title = title;
    this.creatorId = creatorId;
    this.templateId = templateId;
    this.resourceIds = resourceIds;
  }
}
