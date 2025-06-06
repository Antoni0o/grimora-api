import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CreateSystemDto } from './dto/create-system.dto';
import { SystemsService } from './systems.service';
import { UpdateSystemDto } from './dto/update-system.dto';

@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) { }

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
    return this.systemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() request: UpdateSystemDto) {
    return this.systemsService.update(id, request);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemsService.delete(id);
  }
}
