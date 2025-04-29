import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Field from '../../fields/entities/field.entity';

export type SheetDocument = HydratedDocument<Sheet>;

@Schema()
export default class Sheet {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({ type: String, required: true })
  public ownerId!: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Field' }],
  })
  public sections!: Field[];
}

export const SheetSchema = SchemaFactory.createForClass(Sheet);
