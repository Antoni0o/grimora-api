import { OmitType } from '@nestjs/mapped-types';
import { CreateSystemDto } from './create-system.dto';

export class UpdateSystemDto extends OmitType(CreateSystemDto, ['creatorId', 'templateId'] as const) { }
