export class System {
  id: string;
  title: string;
  creatorId: string;
  templateId: string;
  resourceIds?: string[];

  constructor(id: string, title: string, creatorId: string, templateId: string, resourcesIds?: string[]) {
    this.id = id;
    this.title = title;
    this.creatorId = creatorId;
    this.templateId = templateId;
    this.resourceIds = resourcesIds;
  }
}
