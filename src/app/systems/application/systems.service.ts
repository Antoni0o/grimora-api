import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import { SystemResponseDto } from './dto/system-response.dto';
import { UpdateSystemRequestDto } from './dto/update-system.dto';
import { System } from '../domain/entities/system.entity';

@Injectable()
export class SystemsService {
  constructor(@Inject(SYSTEM_REPOSITORY) private readonly repository: ISystemRepository) { }

  async create(request: CreateSystemDto): Promise<SystemResponseDto> {
    const system = new System('', request.title, request.creatorId, request.templateId, request.resourceIds);

    const response = await this.repository.create(system);

    if (!response) throw new InternalServerErrorException('Internal Error at RPG System creation. Try again, later.');

    return this.mapToDto(response);
  }

  async findAll(): Promise<SystemResponseDto[]> {
    const systems = await this.repository.findAll();

    if (!systems) throw new InternalServerErrorException('Internal Error at RPG Systems search. Try again, later.');

    return systems.map(system => this.mapToDto(system));
  }

  async findOne(id: string): Promise<SystemResponseDto> {
    const system = await this.repository.findById(id);

    if (!system) throw new NotFoundException(`System with id: ${id}, not found!`);

    return this.mapToDto(system);
  }

  update(id: number, request: UpdateSystemRequestDto) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
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
