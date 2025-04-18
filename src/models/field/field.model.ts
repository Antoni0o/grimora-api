export default abstract class BaseFieldModel {
  constructor(
    public id: string,
    public key: string,
    public name: string,
    public readonly: boolean,
    public required: boolean,
    public hidden: boolean,
  ) {}

  abstract clone(): BaseFieldModel;
}
