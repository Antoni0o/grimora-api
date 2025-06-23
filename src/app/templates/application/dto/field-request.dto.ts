import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { FieldType } from "../../domain/enums/field-type.enum";

export class FieldRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsEnum(FieldType)
  type: FieldType;

  @IsMongoId()
  @IsOptional()
  id?: string;

  @IsArray()
  @IsOptional()
  fields?: FieldRequestDto[];

  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  resourceId?: string;

  constructor(
    title: string,
    type: FieldType,
    id?: string,
    fields?: FieldRequestDto[],
    key?: string,
    value?: string,
    resourceId?: string
  ) {
    this.title = title;
    this.type = type;
    this.id = id;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
  }
}