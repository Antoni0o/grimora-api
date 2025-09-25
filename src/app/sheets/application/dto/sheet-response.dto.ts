import { IsMongoId, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { FieldType } from '../../../templates/domain/enums/field-type.enum';

export class SheetResponseDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsMongoId()
  @IsNotEmpty()
  templateId: string;

  @IsNotEmpty()
  values: Record<string, unknown>;

  constructor(id: string, title: string, ownerId: string, templateId: string, values: Record<string, unknown>) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.templateId = templateId;
    this.values = values;
  }
}

export class FieldPopulatedResponseDto {
  id: string;
  title: string;
  type: FieldType;
  fields?: FieldPopulatedResponseDto[];
  key?: string;
  value?: string;
  resourceId?: string;

  constructor(
    id: string,
    title: string,
    type: FieldType,
    fields: FieldPopulatedResponseDto[] = [],
    key?: string,
    value?: string,
    resourceId?: string,
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
  }
}

export class TemplatePopulatedResponseDto {
  id: string;
  title: string;
  fields: FieldPopulatedResponseDto[];

  constructor(id: string, title: string, fields: FieldPopulatedResponseDto[] = []) {
    this.id = id;
    this.title = title;
    this.fields = fields;
  }
}

export class SheetPopulatedResponseDto {
  id: string;
  title: string;
  ownerId: string;
  template: TemplatePopulatedResponseDto;
  values: Record<string, unknown>;

  constructor(
    id: string,
    title: string,
    ownerId: string,
    template: TemplatePopulatedResponseDto,
    values: Record<string, unknown>,
  ) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.template = template;
    this.values = values;
  }
}
