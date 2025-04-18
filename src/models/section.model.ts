import FieldModel from './field/field.model';

export default class SectionModel {
  constructor(
    public id: string,
    public name: string,
    public order: number,
    public fields: FieldModel[],
  ) {}
}
