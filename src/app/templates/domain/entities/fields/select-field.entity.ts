import { FieldResponseDto } from 'src/app/templates/application/dto/field-response.dto';
import { PositionDto } from 'src/app/templates/application/dto/position.dto';
import { FieldType } from '../../enums/field-type.enum';
import { FieldData } from '../../interfaces/field.interface';
import { Field } from './field.entity';

export class SelectField extends Field {
  resourceId: string;

  constructor(data: FieldData) {
    super(data, FieldType.SELECT);
    this.resourceId = data.resourceId || '';
  }

  toDto(): FieldResponseDto {
    const positionDtos = this.positions.map(pos => new PositionDto(pos.row, pos.col));
    return new FieldResponseDto(
      this.id,
      this.title,
      this.type,
      positionDtos,
      [],
      undefined,
      undefined,
      this.resourceId,
    );
  }
}
