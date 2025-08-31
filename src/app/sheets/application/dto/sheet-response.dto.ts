import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SheetResponseDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsMongoId()
  @IsNotEmpty()
  templateId: string;

  @IsNotEmpty()
  values: Record<string, unknown>;

  constructor(id: string, title: string, ownerId: string, templateId: string, values: Record<string, unknown>) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.templateId = templateId;
    this.values = values;
  }
}
