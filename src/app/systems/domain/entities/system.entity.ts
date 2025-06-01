export class System {
  id: string;
  title: string;
  creatorId: string;
  resourceIds?: string[];
  templateId?: string;

  constructor(id: string, title: string, creatorId: string, resourcesIds?: string[], templateId?: string) {
    this.id = id;
    this.title = title;
    this.creatorId = creatorId;
    this.resourceIds = resourcesIds;
    this.templateId = templateId;
  }
}
