import { Module } from '@nestjs/common';
import { TemplatesService } from './application/templates.service';
import { TemplatesController } from './application/templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateMongoSchema, TemplateSchema } from './infraestructure/template.schema';
import { TemplatesRepository as TemplatesRepository } from './infraestructure/template.mongoose.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: TemplateMongoSchema.name, schema: TemplateSchema }])],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    {
      provide: 'TEMPLATES_REPOSITORY',
      useClass: TemplatesRepository,
    },
  ],
  exports: [TemplatesService],
})
export class TemplatesModule {}
