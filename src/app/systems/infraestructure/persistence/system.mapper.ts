import { System } from '../../domain/entities/system.entity';
import { SystemDocument } from './system.schema';

export class SystemMapper {
  static toDomain(document: SystemDocument): System {
    return new System(
      document._id.toString(),
      document.title,
      document.creatorId,
      document.resources.map(resource => resource.toString()),
      document.template.toString(),
    );
  }
}
