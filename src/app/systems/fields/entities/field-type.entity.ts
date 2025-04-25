import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FieldTypeDocument = HydratedDocument<FieldType>;

@Schema()
export default class FieldType {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Boolean, default: false })
  default!: boolean;

  @Prop({ type: Object })
  configSchema!: object;
}

export const FieldTypeSchema = SchemaFactory.createForClass(FieldType);
