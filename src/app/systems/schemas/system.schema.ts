import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemDocument = HydratedDocument<SystemMongoSchema>;

@Schema({ timestamps: true, versionKey: false })
export class SystemMongoSchema {}

export const SystemSchema = SchemaFactory.createForClass(SystemMongoSchema);
