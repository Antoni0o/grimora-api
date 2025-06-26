import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaDefinitionProperty, Types } from 'mongoose';
import { FieldType } from '../domain/enums/field-type.enum';
import { Field } from '../domain/entities/fields/field.entity';

export type FieldDocument = HydratedDocument<FieldMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class FieldMongoSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, enum: FieldType, required: true })
  type!: FieldType;

  fields?: FieldMongoSchema[];

  @Prop({ type: String, required: false })
  key?: string;

  @Prop({ type: String, required: false })
  value?: string;

  @Prop({ type: String, required: false })
  resourceId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FieldSchema = SchemaFactory.createForClass(FieldMongoSchema);
FieldSchema.add({
  fields: {
    type: [FieldSchema],
    default: [],
    required: false,
  },
} satisfies {
  fields: SchemaDefinitionProperty<FieldMongoSchema[] | undefined>;
});

export type TemplateDocument = HydratedDocument<TemplateMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class TemplateMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: [FieldSchema], required: true, default: [] })
  fields?: FieldMongoSchema[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(TemplateMongoSchema);
