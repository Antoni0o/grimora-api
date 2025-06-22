import { Module } from '@nestjs/common';
import { TemplatesService } from './application/templates.service';
import { TemplatesController } from './application/templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateMongoSchema, TemplateSchema } from './infraestructure/template.schema';
import { AuthModule } from '../auth/auth.module';
import { TemplateRepository } from './infraestructure/template.mongoose.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TemplateMongoSchema.name, schema: TemplateSchema }]),
    AuthModule
  ],
  controllers: [TemplatesController],
  providers: [
    TemplatesService,
    {
      provide: 'TEMPLATE_REPOSITORY',
      useClass: TemplateRepository,
    }
  ],
})
export class TemplatesModule { }
