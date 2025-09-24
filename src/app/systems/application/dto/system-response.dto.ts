import { FieldType } from '../../../templates/domain/enums/field-type.enum';

export class SystemResponseDto {
  id: string;
  title: string;
  creatorId: string;
  templateIds: string[];
  resourceIds: string[];

  constructor(id: string, title: string, creatorId: string, templateIds: string[], resourceIds: string[] = []) {
    this.id = id;
    this.title = title;
    this.creatorId = creatorId;
    this.templateIds = templateIds;
    this.resourceIds = resourceIds;
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

export class ResourceItemPopulatedResponseDto {
  id: string;
  name: string;
  description: string;
  props: Record<string, unknown>;

  constructor(id: string, name: string, description: string, props: Record<string, unknown>) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.props = props;
  }
}

export class ResourcePopulatedResponseDto {
  id: string;
  name: string;
  items: ResourceItemPopulatedResponseDto[];

  constructor(id: string, name: string, items: ResourceItemPopulatedResponseDto[]) {
    this.id = id;
    this.name = name;
    this.items = items;
  }
}

export class SystemPopulatedResponseDto {
  id: string;
  title: string;
  creatorId: string;
  templates: TemplatePopulatedResponseDto[];
  resources: ResourcePopulatedResponseDto[];

  constructor(
    id: string,
    title: string,
    creatorId: string,
    templates: TemplatePopulatedResponseDto[],
    resources: ResourcePopulatedResponseDto[] = [],
  ) {
    this.id = id;
    this.title = title;
    this.creatorId = creatorId;
    this.templates = templates;
    this.resources = resources;
  }
}
