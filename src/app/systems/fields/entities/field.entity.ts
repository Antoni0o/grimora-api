import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import FieldType from './field-type.entity';

export type FieldDocument = HydratedDocument<Field>;

@Schema()
export default class Field {
  @Prop({ type: String, required: true })
  public name!: string;

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

  @Prop({ type: [Types.ObjectId], ref: Field.name, default: [] })
  public children?: Field[];

  @Prop({ type: String, required: false })
  public value?: string | number;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
