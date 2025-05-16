export default class CreateFieldResponse {
  constructor(
    public readonly _id: string,
    public readonly name: string,
    public readonly childrenIds?: Array<string>,
  ) {}
}
