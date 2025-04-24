import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FieldDocument = HydratedDocument<Field>;

@Schema()
export class FieldType {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ type: Object })
  configSchema!: object;
}

@Schema()
export default class Field {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({ type: String, required: true })
  public key!: string;

  @Prop({ type: String, required: false })
  public description!: string;

  @Prop({ type: Types.ObjectId, ref: 'FieldType', required: true })
  type!: FieldType;

  @Prop({ type: Object, required: false })
  public config!: object;

  @Prop({ type: Boolean, default: false })
  public required!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly!: boolean;

  @Prop({ type: Array, default: [] })
  public children?: Field[];

  @Prop({ type: String, required: false })
  public value?: string | number;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
