import { Template } from 'src/app/templates/domain/entities/template.entity';

export class Sheet {
  id: string;
  title: string;
  ownerId: string;
  template: Template;
  values: Record<string, unknown>;

  constructor(id: string, title: string, ownerId: string, template: Template, values: Record<string, unknown>) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.template = template;
    this.values = values;
  }
}
