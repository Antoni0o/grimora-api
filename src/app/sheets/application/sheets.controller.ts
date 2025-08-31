import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { JwtAuthGuard } from 'src/app/auth/guard/jwt-auth.guard';
import { User } from 'src/app/auth/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Post()
  create(@Body() createSheetDto: CreateSheetDto, @User('sub') requesterId: string) {
    createSheetDto.ownerId = requesterId;

    return this.sheetsService.create(createSheetDto);
  }

  @Get()
  findAll() {
    return this.sheetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sheetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSheetDto: UpdateSheetDto, @User('sub') requesterId: string) {
    updateSheetDto.requesterId = requesterId;
    return this.sheetsService.update(id, updateSheetDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @User('sub') requesterId: string) {
    return this.sheetsService.delete(id, requesterId);
  }
}
