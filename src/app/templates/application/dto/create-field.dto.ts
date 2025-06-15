import { FieldType } from "../../domain/enums/field-type.enum";

export class CreateFieldDto {
  title: string;
  type: FieldType;
  fields?: CreateFieldDto[];
  key?: string;
  value?: string;
  resourceId?: string;

  constructor(
    title: string,
    type: FieldType,
    fields?: CreateFieldDto[],
    key?: string,
    value?: string,
    resourceId?: string
  ) {
    this.title = title;
    this.type = type;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
  }
}