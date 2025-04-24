import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Field from '../../fields/entities/field.entity';

export type SheetDocument = HydratedDocument<Sheet>;

@Schema()
export default class Sheet {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({ type: String, required: true, unique: true })
  public ownerId!: string;

  @Prop({
    type: raw({
      name: { type: String, required: true },
      key: { type: String, required: true },
      fields: { type: [Types.ObjectId], ref: 'Field' },
    }),
  })
  public sections!: Array<{
    name: string;
    key: string;
    fields: Field[];
  }>;
}

export const SheetSchema = SchemaFactory.createForClass(Sheet);
