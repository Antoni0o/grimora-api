import { Injectable } from '@nestjs/common';
import { IResourcesRepository } from '../domain/repositories/resources.repository';
import { InjectModel } from '@nestjs/mongoose';
import { ResourceDocument, ResourceMongoSchema } from './resource.schema';
import { Resource } from '../domain/entities/resource.entity';
import { Model, Types } from 'mongoose';
import { ResourceMapper } from './resources.mapper';

@Injectable()
export class ResourceRepository implements IResourcesRepository {
  constructor(@InjectModel(ResourceMongoSchema.name) private readonly resourceModel: Model<ResourceDocument>) {}

  async findAll(): Promise<Resource[] | null> {
    const resources = await this.resourceModel.find();

    if (!resources) return null;

    return resources.map(resource => ResourceMapper.resourceToDomain(resource));
  }

  async findById(id: string): Promise<Resource | null> {
    const resource = await this.resourceModel.findById(id);

    if (!resource) return null;

    return ResourceMapper.resourceToDomain(resource);
  }

  async create(resource: Resource): Promise<Resource | null> {
    const createdResource = await this.resourceModel.create({
      name: resource.name,
      resourceItems: resource.items,
    });

    if (!createdResource) return null;

    return ResourceMapper.resourceToDomain(createdResource);
  }

  async update(id: string, resource: Resource): Promise<Resource | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const resourceToUpdate = await this.resourceModel
      .findByIdAndUpdate(
        id,
        {
          title: resource.name,
          fields: resource.items,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!resourceToUpdate) return null;

    return ResourceMapper.resourceToDomain(resourceToUpdate);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedResource = await this.resourceModel.findByIdAndDelete(id).exec();

    if (!deletedResource) return false;

    return true;
  }
}
