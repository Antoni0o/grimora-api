import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { RESOURCES_REPOSITORY } from '../domain/constants/resources.constants';
import { IResourcesRepository } from '../domain/repositories/resources.repository';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { Resource } from '../domain/entities/resource.entity';
import { ResourceItemRequestDto } from './dto/resource-item-request.dto';
import { ResourceItem } from '../domain/entities/resource-item.entity';
import { ResourceItemResponseDto } from './dto/resource-item-response.dto';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at Resource operation. Try again, later.';
const NOT_FOUND_MESSAGE = 'Resource not found.';

@Injectable()
export class ResourcesService {
  constructor(@Inject(RESOURCES_REPOSITORY) private readonly repository: IResourcesRepository) {}

  async create(request: CreateResourceDto): Promise<ResourceResponseDto> {
    const resource = new Resource('', request.name, this.mapItems(request.items));

    const response = await this.repository.create(resource);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async findAll(): Promise<ResourceResponseDto[]> {
    const response = await this.repository.findAll();

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response.map(template => this.mapToDto(template));
  }

  async findOne(id: string): Promise<ResourceResponseDto> {
    const response = await this.repository.findById(id);

    if (!response) throw new NotFoundException(NOT_FOUND_MESSAGE);

    return this.mapToDto(response);
  }

  async update(id: string, request: UpdateResourceDto): Promise<ResourceResponseDto> {
    const resource = await this.repository.findById(id);

    if (!resource) throw new NotFoundException(NOT_FOUND_MESSAGE);

    resource.name = request.name;
    resource.items = this.mapItems(request.items);

    const response = await this.repository.update(id, resource);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  async delete(id: string): Promise<boolean> {
    const template = await this.repository.findById(id);

    if (!template) throw new NotFoundException(NOT_FOUND_MESSAGE);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  private mapItems(items: ResourceItemRequestDto[]): ResourceItem[] {
    return items.map(item => new ResourceItem('', item.name, item.description, item.props));
  }

  private mapToDto(resource: Resource): ResourceResponseDto {
    return new ResourceResponseDto(
      resource.id,
      resource.name,
      resource.items.map(item => new ResourceItemResponseDto(item.id, item.name, item.description, item.props)),
    );
  }
}
