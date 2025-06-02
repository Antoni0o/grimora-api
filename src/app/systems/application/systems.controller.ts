import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { UpdateSystemRequestDto } from './dto/update/update-system-request.dto';
import { CreateSystemDto } from './dto/create-system.dto';
import { SystemsService } from './systems.service';

@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  create(@Body() request: CreateSystemDto) {
    return this.systemsService.create(request);
  }

  @Get()
  findAll() {
    return this.systemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() request: UpdateSystemRequestDto) {
    return this.systemsService.update(+id, request);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemsService.remove(+id);
  }
}
