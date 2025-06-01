import { Inject, Injectable } from '@nestjs/common';
import { UpdateSystemRequestDto } from './dto/update/update-system-request.dto';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemRequestDto } from './dto/create/create-system-request.dto';

@Injectable()
export class SystemsService {
  constructor(@Inject(SYSTEM_REPOSITORY) private readonly systemRepository: ISystemRepository) {}

  create(request: CreateSystemRequestDto) {
    return 'This action adds a new system';
  }

  findAll() {
    return `This action returns all systems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} system`;
  }

  update(id: number, request: UpdateSystemRequestDto) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
  }
}
