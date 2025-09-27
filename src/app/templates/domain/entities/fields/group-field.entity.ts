import { FieldResponseDto } from 'src/app/templates/application/dto/field-response.dto';
import { PositionDto } from 'src/app/templates/application/dto/position.dto';
import { FieldType } from '../../enums/field-type.enum';
import { FieldData } from '../../interfaces/field.interface';
import { Field } from './field.entity';

export class GroupField extends Field {
  fields: Field[];

  constructor(data: FieldData) {
    super(data, FieldType.GROUP);
    this.fields = [];
  }

  toDto(): FieldResponseDto {
    const positionDtos = this.positions.map(pos => new PositionDto(pos.row, pos.col));
    const fieldDtos = this.fields.map(field => field.toDto());
    return new FieldResponseDto(this.id, this.title, this.type, positionDtos, fieldDtos);
  }
}
