import SectionModel from './section.model';

export default class TemplateModel {
  constructor(
    public id: string,
    public name: string,
    public systemId: string,
    public sections: SectionModel[],
  ) {}
}
