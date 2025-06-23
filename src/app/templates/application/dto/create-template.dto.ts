import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { FieldRequestDto } from "./field-request.dto";

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsArray()
  fields: FieldRequestDto[];

  constructor(title: string, fields: FieldRequestDto[]) {
    this.title = title;
    this.fields = fields;
  }
}
