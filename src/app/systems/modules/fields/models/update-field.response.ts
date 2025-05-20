export default class UpdateFieldResponse {
  constructor(
    public readonly _id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly config?: Record<string, string>,
    public readonly typeId?: string | undefined,
    public readonly readonly?: boolean,
    public readonly required?: boolean,
    public readonly value?: unknown,
  ) {}
}
