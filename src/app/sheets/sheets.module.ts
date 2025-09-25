import { Module } from '@nestjs/common';
import { SheetsService } from './application/sheets.service';
import { SheetsController } from './application/sheets.controller';
import { SHEETS_REPOSITORY } from './domain/constants/sheets.constants';
import { SheetsRepository } from './infraestructure/sheets.mongoose.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SheetMongoSchema, SheetSchema } from './infraestructure/sheets.schema';
import { TemplateMongoSchema, TemplateSchema } from '../templates/infraestructure/template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SheetMongoSchema.name, schema: SheetSchema },
      { name: TemplateMongoSchema.name, schema: TemplateSchema },
    ]),
  ],
  controllers: [SheetsController],
  providers: [SheetsService, { provide: SHEETS_REPOSITORY, useClass: SheetsRepository }],
})
export class SheetsModule {}
