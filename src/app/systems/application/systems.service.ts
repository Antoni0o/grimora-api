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
import { SystemResponseDto } from './dto/system-response.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { System } from '../domain/entities/system.entity';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at System operation. Try again, later.';
const BAD_REQUEST_MESSAGE = 'Requester is not the Creator.';
const NOT_FOUND_MESSAGE = 'System not found.';

@Injectable()
export class SystemsService {
  constructor(@Inject(SYSTEM_REPOSITORY) private readonly repository: ISystemRepository) {}

  async create(request: CreateSystemDto): Promise<SystemResponseDto> {
    const system = new System('', request.title, request.creatorId, request.templateId, request.resourceIds);

    const response = await this.repository.create(system);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async findAll(): Promise<SystemResponseDto[]> {
    const systems = await this.repository.findAll();

    if (!systems) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return systems.map(system => this.mapToDto(system));
  }

  async findOne(id: string): Promise<SystemResponseDto> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    return this.mapToDto(system);
  }

  async update(id: string, request: UpdateSystemDto): Promise<SystemResponseDto> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (request.requesterId !== system?.creatorId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    system.title = request.title;
    system.resourceIds = request.resourceIds;

    const response = await this.repository.update(id, system);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (userId !== system?.creatorId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  private mapToDto(response: System): SystemResponseDto {
    return new SystemResponseDto(
      response.id,
      response.title,
      response.creatorId,
      response.templateId,
      response.resourceIds,
    );
  }
}
