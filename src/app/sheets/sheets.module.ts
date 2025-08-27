import { Module } from '@nestjs/common';
import { SheetsService } from './application/sheets.service';
import { SheetsController } from './application/sheets.controller';

@Module({
  controllers: [SheetsController],
  providers: [SheetsService],
})
export class SheetsModule {}
