import { Module } from '@nestjs/common';
import { SystemsService } from './application/systems.service';
import { SystemsController } from './application/systems.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemMongoSchema, SystemSchema } from './infraestructure/system.schema';
import { TemplateMongoSchema, TemplateSchema } from '../templates/infraestructure/template.schema';
import { ResourceMongoSchema, ResourceSchema } from '../resources/infraestructure/resources.schema';
import { SYSTEM_REPOSITORY } from './domain/constants/system.constants';
import { SystemRepository } from './infraestructure/system.mongoose.repository';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemMongoSchema.name, schema: SystemSchema },
      { name: TemplateMongoSchema.name, schema: TemplateSchema },
      { name: ResourceMongoSchema.name, schema: ResourceSchema },
    ]),
    LikesModule,
  ],
  controllers: [SystemsController],
  providers: [
    SystemsService,
    {
      provide: SYSTEM_REPOSITORY,
      useClass: SystemRepository,
    },
  ],
  exports: [SystemsService],
})
export class SystemsModule {}
