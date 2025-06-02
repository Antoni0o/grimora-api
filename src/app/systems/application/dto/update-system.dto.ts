import { OmitType } from '@nestjs/mapped-types';
import { CreateSystemDto } from './create-system.dto';

export class UpdateSystemRequestDto extends OmitType(CreateSystemDto, ['creatorId'] as const) {}
