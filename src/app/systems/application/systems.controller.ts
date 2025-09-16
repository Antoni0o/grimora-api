import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { CreateSystemDto } from './dto/create-system.dto';
import { SystemsService } from './systems.service';
import { UpdateSystemDto } from './dto/update-system.dto';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';

@UseGuards(AuthGuard)
@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  create(@Body() request: CreateSystemDto, @Session() session: UserSession) {
    request.creatorId = session.user.id;

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
  delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.systemsService.delete(id, session.user.id);
  }
}
