import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import {
  SystemResponseDto,
  SystemPopulatedResponseDto,
  TemplatePopulatedResponseDto,
  ResourcePopulatedResponseDto,
  FieldPopulatedResponseDto,
  ResourceItemPopulatedResponseDto,
} from './dto/system-response.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { System } from '../domain/entities/system.entity';
import { Resource } from 'src/app/resources/domain/entities/resource.entity';
import { ResourceItem } from 'src/app/resources/domain/entities/resource-item.entity';
import { Template } from 'src/app/templates/domain/entities/template.entity';
import { LikesService } from '../../likes/application/likes.service';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at System operation. Try again, later.';
const BAD_REQUEST_MESSAGE = 'Requester is not the Creator.';
const NOT_FOUND_MESSAGE = 'System not found.';

@Injectable()
export class SystemsService {
  constructor(
    @Inject(SYSTEM_REPOSITORY) private readonly repository: ISystemRepository,
    private readonly likesService: LikesService,
  ) {}

  async create(request: CreateSystemDto): Promise<SystemResponseDto> {
    const system = new System(
      '',
      request.title,
      request.creatorId,
      this.mapTemplateIdsToTemplates(request.templateIds),
      this.mapResourcesIdToResources(request.resourceIds),
    );

    const response = await this.repository.create(system);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async findAll(): Promise<SystemResponseDto[]> {
    const systems = await this.repository.findAll();

    if (!systems) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return systems.map(system => this.mapToDto(system));
  }

  async findByTitle(title: string): Promise<SystemResponseDto[]> {
    const systems = await this.repository.findByTitle(title);

    if (!systems) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return systems.map(system => this.mapToDto(system));
  }

  async findByCreatorId(creatorId: string): Promise<SystemResponseDto[]> {
    const systems = await this.repository.findByCreatorId(creatorId);

    if (!systems) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return systems.map(system => this.mapToDto(system));
  }

  async findOne(id: string): Promise<SystemPopulatedResponseDto> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    return this.mapToPopulatedDto(system);
  }

  async update(id: string, request: UpdateSystemDto): Promise<SystemResponseDto> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (request.requesterId !== system?.creatorId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    system.title = request.title;
    system.description = request.description;
    system.templates = this.mapTemplateIdsToTemplates(request.templateIds);
    system.resources = this.mapResourcesIdToResources(request.resourceIds);

    const response = await this.repository.update(id, system);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (userId !== system?.creatorId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    await this.likesService.deleteAllLikesForEntity('system', id);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  private mapToDto(response: System): SystemResponseDto {
    return new SystemResponseDto(
      response.id,
      response.title,
      response.description,
      response.creatorId,
      response.templates.map(template => template.id),
      response.resources?.map(resource => resource.id) ?? [],
    );
  }

  private mapToPopulatedDto(response: System): SystemPopulatedResponseDto {
    return new SystemPopulatedResponseDto(
      response.id,
      response.title,
      response.description,
      response.creatorId,
      response.templates.map(template => this.mapTemplateToPopulatedDto(template)),
      response.resources?.map(resource => this.mapResourceToPopulatedDto(resource)) ?? [],
    );
  }

  private mapTemplateToPopulatedDto(template: Template): TemplatePopulatedResponseDto {
    return new TemplatePopulatedResponseDto(
      template.id,
      template.title,
      template.fields.map(field => this.mapFieldToPopulatedDto(field)),
    );
  }

  private mapResourceToPopulatedDto(resource: Resource): ResourcePopulatedResponseDto {
    return new ResourcePopulatedResponseDto(
      resource.id,
      resource.name,
      resource.items.map(item => this.mapResourceItemToPopulatedDto(item)),
    );
  }

  private mapFieldToPopulatedDto(field: any): FieldPopulatedResponseDto {
    return new FieldPopulatedResponseDto(
      field.id,
      field.title,
      field.type,
      field.fields?.map((subField: any) => this.mapFieldToPopulatedDto(subField)) ?? [],
      field.key,
      field.value,
      field.resourceId,
    );
  }

  private mapResourceItemToPopulatedDto(item: ResourceItem): ResourceItemPopulatedResponseDto {
    return new ResourceItemPopulatedResponseDto(item.id, item.name, item.description, item.props);
  }

  private mapTemplateIdsToTemplates(templateIds: string[]) {
    return templateIds.map(templateId => new Template(templateId, '', []));
  }

  private mapResourcesIdToResources(resourceIds: string[]) {
    return resourceIds.map(resourceId => new Resource(resourceId, '', [])) ?? [];
  }
}
