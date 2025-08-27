import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SheetDocument = HydratedDocument<SheetMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class SheetMongoSchema {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  template!: Types.ObjectId;

  @Prop({ required: true })
  values!: Map<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SheetSchema = SchemaFactory.createForClass(SheetMongoSchema);
