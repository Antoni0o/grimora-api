import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { CreateFieldDto } from "./create-field.dto";

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsArray()
  fields: CreateFieldDto[];

  constructor(title: string, fields: CreateFieldDto[]) {
    this.title = title;
    this.fields = fields;
  }
}
