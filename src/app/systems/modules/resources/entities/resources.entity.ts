import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import Field, { FieldSchema } from '../../fields/field.entity';

export type ResourcesDocument = HydratedDocument<Resources>;

@Schema()
export default class Resources {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({ type: String, required: true, unique: true })
  public key!: string;

  @Prop({
    type: raw({
      name: { type: String, required: true },
      key: { type: String, required: true },
      fields: { type: [FieldSchema] },
    }),
  })
  public resources!: Array<{
    name: string;
    key: string;
    fields: Field[];
  }>;
}

export const ResourcesSchema = SchemaFactory.createForClass(Resources);
