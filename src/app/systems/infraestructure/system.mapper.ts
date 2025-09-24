import { Document, Types } from 'mongoose';
import { System } from '../domain/entities/system.entity';
import { SystemDocument, SystemMongoSchema } from './system.schema';
import { Resource } from 'src/app/resources/domain/entities/resource.entity';
import { Template } from 'src/app/templates/domain/entities/template.entity';

export class SystemMapper {
  static toDomain(document: SystemDocument): System {
    return new System(
      document._id.toString(),
      document.title,
      document.creatorId,
      SystemMapper.mapTemplates(document),
      SystemMapper.mapResources(document),
    );
  }

  private static mapTemplates(
    document: Document<unknown, {}, SystemMongoSchema, {}, {}> &
      SystemMongoSchema & { _id: Types.ObjectId } & { __v: number },
  ) {
    return (
      document.templates.map(template => {
        if (template instanceof Types.ObjectId) {
          return new Template(template.toHexString(), '', []);
        } else {
          return new Template(template._id?.toString?.() ?? '', template.title ?? '', template.fields ?? []);
        }
      }) ?? []
    );
  }

  private static mapResources(
    document: Document<unknown, {}, SystemMongoSchema, {}, {}> &
      SystemMongoSchema & { _id: Types.ObjectId } & { __v: number },
  ) {
    return (
      document.resources.map(resource => {
        if (resource instanceof Types.ObjectId) {
          return new Resource(resource.toHexString(), '', []);
        } else {
          return new Resource(resource._id?.toString?.() ?? '', resource.title ?? '', resource.items ?? []);
        }
      }) ?? []
    );
  }

  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
