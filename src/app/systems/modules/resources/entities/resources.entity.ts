import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import Field, { FieldSchema } from '../../fields/field.entity';

export type ResourcesDocument = HydratedDocument<Resources>;

@Schema()
export default class Resources {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({
    type: raw({
      name: { type: String, required: true },
      fields: { type: [FieldSchema] },
    }),
  })
  public resources!: Array<{
    name: string;
    fields: Field[];
  }>;
}

export const ResourcesSchema = SchemaFactory.createForClass(Resources);
