import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FieldType } from '../domain/enums/field-type.enum';
import { COLUMNS_LIMIT, ROWS_LIMIT } from '../domain/constants/template.constants';

export interface PositionSchema {
  row: number;
  col: number;
}

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

  @Prop({
    type: [
      {
        row: { type: Number, required: true },
        col: { type: Number, required: true },
      },
    ],
    required: true,
    default: [],
    validate: {
      validator: function (positions: PositionSchema[]) {
        return positions.every(
          pos => pos.row >= 1 && pos.row <= ROWS_LIMIT && pos.col >= 1 && pos.col <= COLUMNS_LIMIT,
        );
      },
      message: `Position values must be between 1 and ${ROWS_LIMIT} for rows and 1 and ${COLUMNS_LIMIT} for columns`,
    },
  })
  positions!: PositionSchema[];

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
});

export type TemplateDocument = HydratedDocument<TemplateMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class TemplateMongoSchema {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: [FieldSchema], required: true, default: [] })
  fields?: FieldMongoSchema[];

  @Prop({
    type: [
      {
        row: { type: Number, required: true },
        col: { type: Number, required: true },
      },
    ],
    required: true,
    default: [],
    validate: {
      validator: function (positions: PositionSchema[]) {
        return positions.every(
          pos => pos.row >= 1 && pos.row <= ROWS_LIMIT && pos.col >= 1 && pos.col <= COLUMNS_LIMIT,
        );
      },
      message: `Position values must be between 1 and ${ROWS_LIMIT} for rows and 1 and ${COLUMNS_LIMIT} for columns`,
    },
  })
  usedPositions!: PositionSchema[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(TemplateMongoSchema);
