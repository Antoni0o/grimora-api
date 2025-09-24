import { OmitType } from '@nestjs/mapped-types';
import { CreateSystemDto } from './create-system.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateSystemDto extends OmitType(CreateSystemDto, ['creatorId'] as const) {
  @IsUUID()
  @IsString()
  requesterId?: string;
}
