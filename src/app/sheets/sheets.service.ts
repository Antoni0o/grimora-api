import { Injectable } from '@nestjs/common';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';

@Injectable()
export class SheetsService {
  create(createSheetDto: CreateSheetDto) {
    return 'This action adds a new sheet';
  }

  findAll() {
    return `This action returns all sheets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sheet`;
  }

  update(id: number, updateSheetDto: UpdateSheetDto) {
    return `This action updates a #${id} sheet`;
  }

  remove(id: number) {
    return `This action removes a #${id} sheet`;
  }
}
