import { FieldResponseDto } from 'src/app/templates/application/dto/field-response.dto';
import { FieldType } from '../../enums/field-type.enum';
import { FieldData } from '../../interfaces/field.interface';
import { Position } from '../position.entity';

export abstract class Field {
  id: string;
  title: string;
  type: FieldType;
  positions: Position[];

  constructor(data: FieldData, type: FieldType) {
    this.id = data.id;
    this.title = data.title;
    this.type = type;
    this.positions = [...data.positions];
  }

  abstract toDto(): FieldResponseDto;
}
