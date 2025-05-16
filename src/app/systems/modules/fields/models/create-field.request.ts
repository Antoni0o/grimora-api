import { Types } from 'mongoose';

export default class CreateFieldRequest {
  constructor(
    public _id: Types.ObjectId,
    public name: string,
    public typeId: Types.ObjectId,
    public required: boolean = false,
    public readonly: boolean = false,
    public description?: string,
    public value?: string | number | null,
    public childrenIds?: Array<Types.ObjectId>,
    public config?: object,
  ) {}
}
