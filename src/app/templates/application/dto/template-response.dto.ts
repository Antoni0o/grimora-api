import { FieldResponseDto } from "./field-response.dto";

export class TemplateResponseDto {
  id: string;
  title: string;
  fields: FieldResponseDto[];

  constructor(id: string, title: string, fields: FieldResponseDto[] = []) {
    this.id = id;
    this.title = title;
    this.fields = fields;
  }
}