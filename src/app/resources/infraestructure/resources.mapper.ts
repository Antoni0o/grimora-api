import { Types } from 'mongoose';
import { Resource } from '../domain/entities/resource.entity';
import { ResourceDocument } from './resource.schema';
import { ResourceItem } from '../domain/entities/resource-item.entity';
import { ResourceItemMongoSchema } from './resource-item.schema';

export class ResourceMapper {
  static resourceToDomain(document: ResourceDocument): Resource {
    return new Resource(
      document._id.toString(),
      document.name,
      document.resourceItems
        ? document.resourceItems?.map(resourceItem => ResourceMapper.resourceItemToDomain(resourceItem))
        : [],
    );
  }

  private static resourceItemToDomain(resourceItem: ResourceItemMongoSchema): ResourceItem {
    return new ResourceItem(
      resourceItem._id.toString(),
      resourceItem.name,
      resourceItem.description,
      resourceItem.props,
    );
  }

  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
