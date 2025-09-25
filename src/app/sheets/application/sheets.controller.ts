import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { SheetPopulatedResponseDto } from './dto/sheet-response.dto';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { UserSession } from 'src/lib/auth';

@UseGuards(AuthGuard)
@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Post()
  create(@Body() createSheetDto: CreateSheetDto, @Session() session: UserSession) {
    createSheetDto.ownerId = session.user.id;
    createSheetDto.ownerSheetsCount = session.user.sheets_count;
    createSheetDto.ownerSheetsLimit = session.user.sheets_limit;

    return this.sheetsService.create(createSheetDto);
  }

  @Get()
  findAll() {
    return this.sheetsService.findAll();
  }

  @Get('owner/me')
  findByOwnerId(@Session() session: UserSession) {
    return this.sheetsService.findByOwnerId(session.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SheetPopulatedResponseDto> {
    return this.sheetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSheetDto: UpdateSheetDto, @Session() session: UserSession) {
    updateSheetDto.requesterId = session.user.id;
    return this.sheetsService.update(id, updateSheetDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.sheetsService.delete(id, session.user.id);
  }
}
