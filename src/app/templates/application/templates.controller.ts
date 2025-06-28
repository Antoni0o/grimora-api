import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from 'src/app/auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Body() requestBody: CreateTemplateDto) {
    return this.templatesService.create(requestBody);
  }

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() requestBody: UpdateTemplateDto) {
    return this.templatesService.update(id, requestBody);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }
}
