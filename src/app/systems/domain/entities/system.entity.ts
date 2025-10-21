import { Resource } from 'src/app/resources/domain/entities/resource.entity';
import { Template } from 'src/app/templates/domain/entities/template.entity';

export class System {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  templates: Template[];
  resources?: Resource[];

  constructor(
    id: string,
    title: string,
    creatorId: string,
    templates: Template[],
    resources?: Resource[],
    description?: string,
  ) {
    this.id = id;
    this.title = title;
    this.description = description ?? '';
    this.creatorId = creatorId;
    this.templates = templates;
    this.resources = resources;
  }
}
