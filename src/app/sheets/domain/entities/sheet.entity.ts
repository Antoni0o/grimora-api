export class Sheet {
  id: string;
  title: string;
  ownerId: string;
  templateId: string;
  values: Map<string, unknown>;

  constructor(id: string, title: string, ownerId: string, templateId: string, values: Map<string, unknown>) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.templateId = templateId;
    this.values = values;
  }
}
