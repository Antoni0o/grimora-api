import { CreateFieldDto } from "./create-field.dto";

export class CreateTemplateDto {
  title: string;
  fields: CreateFieldDto[];

  constructor(title: string, fields: CreateFieldDto[]) {
    this.title = title;
    this.fields = fields;
  }
}
