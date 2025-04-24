import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Resources from './resources/entities/resources.entity';
import Template from './templates/entities/template.entity';
import { FieldType } from './fields/entities/field.entity';

export type SystemDocument = HydratedDocument<System>;

@Schema()
export default class System {
  @Prop({ type: String, required: true })
  public name!: string;

  @Prop({ type: String, required: false })
  public description!: string;

  @Prop({ type: Boolean, default: false })
  public isRulesActive!: boolean;

  @Prop({ type: String, required: false })
  public version!: string;

  @Prop({ type: Boolean, default: false })
  public isPublic!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'FieldType', required: true })
  public fieldTypes!: FieldType[];

  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  public template!: Template;

  @Prop({ type: [Types.ObjectId], ref: 'Resources', required: true })
  public resources!: Resources[];

  @Prop({ type: String, required: true })
  public creatorId!: string;
}

export const SystemSchema = SchemaFactory.createForClass(System);
