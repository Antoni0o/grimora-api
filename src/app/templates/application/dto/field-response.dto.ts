import { FieldType } from '../../domain/enums/field-type.enum';
import { PositionDto } from './position.dto';

export class FieldResponseDto {
  id: string;
  title: string;
  type: FieldType;
  fields?: FieldResponseDto[];
  key?: string;
  value?: string;
  resourceId?: string;
  positions: PositionDto[];

  constructor(
    id: string,
    title: string,
    type: FieldType,
    positions: PositionDto[],
    fields: FieldResponseDto[] = [],
    key?: string,
    value?: string,
    resourceId?: string,
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.positions = positions;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
  }
}
