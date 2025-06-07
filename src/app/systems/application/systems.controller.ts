import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { CreateSystemDto } from './dto/create-system.dto';
import { SystemsService } from './systems.service';
import { UpdateSystemDto } from './dto/update-system.dto';
import { JwtAuthGuard } from 'src/app/auth/guard/jwt-auth.guard';
import { User } from 'src/app/auth/decorators/user.decorator';
import JwtPayloadModel from 'src/app/auth/models/jwt-payload.model';

@UseGuards(JwtAuthGuard)
@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) { }

  @Post()
  create(
    @Body() request: CreateSystemDto,
    @User() user: JwtPayloadModel
  ) {
    request.creatorId = user.sub;

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
