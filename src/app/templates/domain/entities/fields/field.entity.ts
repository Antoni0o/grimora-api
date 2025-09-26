import { FieldResponseDto } from 'src/app/templates/application/dto/field-response.dto';
import { FieldType } from '../../enums/field-type.enum';
import { FieldData } from '../../interfaces/field.interface';

export abstract class Field {
  id: string;
  title: string;
  type: FieldType;
  columns: number[];
  rows: number[];

  constructor(data: FieldData, type: FieldType) {
    this.id = data.id;
    this.title = data.title;
    this.type = type;
    this.columns = data.columns;
    this.rows = data.rows;
  }

  abstract toDto(): FieldResponseDto;
}
