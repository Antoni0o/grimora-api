import { FieldType } from "../../domain/enums/field-type.enum";

export class FieldResponseDto {
  id: string;
  name: string;
  type: FieldType;
  fields?: FieldResponseDto[];
  key?: string;
  value?: string;
  resourceId?: string;

  constructor(
    id: string,
    name: string,
    type: FieldType,
    fields: FieldResponseDto[] = [],
    key?: string,
    value?: string,
    resourceId?: string
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
  }
}