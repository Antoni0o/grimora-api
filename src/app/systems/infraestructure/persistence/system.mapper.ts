import { Types } from 'mongoose';
import { System } from '../../domain/entities/system.entity';
import { SystemDocument } from './system.schema';

export class SystemMapper {
  static toDomain(document: SystemDocument): System {
    return new System(
      document._id.toString(),
      document.title,
      document.creatorId,
      document.template.toString(),
      document.resources.map(resource => resource.toString()),
    );
  }

  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
