export class ResourceItem {
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
