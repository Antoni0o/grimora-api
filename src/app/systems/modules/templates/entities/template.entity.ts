import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Field from '../../fields/field.entity';

export type TemplateDocument = HydratedDocument<Template>;

@Schema()
export default class Template {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Field' }],
  })
  public sections!: Field[];
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
