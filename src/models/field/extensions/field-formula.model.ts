import FieldModel from '../field.model';

export default class FieldFormulaModel extends FieldModel {
  public value: number;
  public formula: string;

  constructor(
    id: string,
    key: string,
    name: string,
    isReadonly: boolean,
    isRequired: boolean,
    isHidden: boolean,
    formula: string,
    value: number = 0,
  ) {
    super(id, key, name, isReadonly, isRequired, isHidden);

    this.formula = formula;
    this.value = value;
  }
}
