import { OmitType } from '@nestjs/mapped-types';
import { CreateSheetDto } from './create-sheet.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateSheetDto extends OmitType(CreateSheetDto, [
  'ownerId',
  'ownerSheetsCount',
  'ownerSheetsLimit',
  'templateId',
] as const) {
  @IsUUID()
  @IsString()
  requesterId?: string;
}
