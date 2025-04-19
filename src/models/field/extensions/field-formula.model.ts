import BaseFieldWithValueModel from '../field-with-value.model';

export default class FieldFormulaModel extends BaseFieldWithValueModel<number> {
  public formula: string;

  constructor(
    id: string,
    key: string,
    name: string,
    readonly: boolean,
    required: boolean,
    hidden: boolean,
    formula: string,
    value: number = 0,
  ) {
    super(id, key, name, readonly, required, hidden, value);

    this.formula = formula;
  }

  clone(): FieldFormulaModel {
    return new FieldFormulaModel(
      this.id,
      this.key,
      this.name,
      this.readonly,
      this.required,
      this.hidden,
      this.formula,
      this.value,
    );
  }
}
