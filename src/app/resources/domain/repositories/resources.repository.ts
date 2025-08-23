import { Resource } from '../entities/resource.entity';

export interface IResourcesRepository {
  findAll(): Promise<Resource[] | null>;

  findById(id: string): Promise<Resource | null>;

  create(resource: Resource): Promise<Resource | null>;

  update(id: string, resource: Resource): Promise<Resource | null>;

  delete(id: string): Promise<boolean>;
}
