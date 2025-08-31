import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';

export class UpdateResourceDto extends OmitType(CreateResourceDto, []) {}
