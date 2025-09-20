import { IsMongoId, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateSheetDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsString()
  ownerId: string;

  @IsNumber()
  ownerSheetsLimit: number;

  @IsNumber()
  ownerSheetsCount: number;

  @IsNotEmpty()
  @IsMongoId()
  templateId: string;

  @IsNotEmpty()
  values: Record<string, unknown>;

  constructor(
    title: string,
    ownerId: string,
    ownerSheetsLimit: number,
    ownerSheetsCount: number,
    templateId: string,
    values: Record<string, unknown>,
  ) {
    this.title = title;
    this.ownerId = ownerId;
    this.ownerSheetsLimit = ownerSheetsLimit;
    this.ownerSheetsCount = ownerSheetsCount;
    this.templateId = templateId;
    this.values = values;
  }
}
