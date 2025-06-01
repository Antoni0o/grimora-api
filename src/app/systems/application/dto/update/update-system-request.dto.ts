import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemRequestDto } from '../create/create-system-request.dto';

export class UpdateSystemRequestDto extends PartialType(CreateSystemRequestDto) {}
