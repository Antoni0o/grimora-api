export default class FieldModel {
  constructor(
    public id: string,
    public key: string,
    public name: string,
    public isReadonly: boolean,
    public isRequired: boolean,
    public isHidden: boolean,
  ) {}
}
