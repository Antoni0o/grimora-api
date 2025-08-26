import { Module } from '@nestjs/common';
import { TemplatesService } from './application/templates.service';
import { TemplatesController } from './application/templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateMongoSchema, TemplateSchema } from './infraestructure/template.schema';
import { AuthModule } from '../auth/auth.module';
import { TemplatesRepository as TemplatesRepository } from './infraestructure/template.mongoose.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: TemplateMongoSchema.name, schema: TemplateSchema }]), AuthModule],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    {
      provide: 'TEMPLATES_REPOSITORY',
      useClass: TemplatesRepository,
    },
  ],
})
export class TemplatesModule {}
