import { Injectable } from '@nestjs/common';
import { CreateSystemDto } from './dto/create/create-system.dto';
import { UpdateSystemRequestDto } from './dto/update/update-system-request.dto';

@Injectable()
export class SystemsService {
  create(createSystemDto: CreateSystemDto) {
    return 'This action adds a new system';
  }

  findAll() {
    return `This action returns all systems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} system`;
  }

  update(id: number, updateSystemDto: UpdateSystemRequestDto) {
    return `This action updates a #${id} system`;
  }

  remove(id: number) {
    return `This action removes a #${id} system`;
  }
}
