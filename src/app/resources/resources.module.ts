import { Module } from '@nestjs/common';
import { ResourcesService } from './application/resources.service';
import { ResourcesController } from './application/resources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceMongoSchema, ResourceSchema } from './infraestructure/resources.schema';
import { ResourcesRepository } from './infraestructure/resources.mongoose.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: ResourceMongoSchema.name, schema: ResourceSchema }])],
  controllers: [ResourcesController],
  providers: [
    ResourcesService,
    {
      provide: 'RESOURCES_REPOSITORY',
      useClass: ResourcesRepository,
    },
  ],
  exports: [ResourcesService],
})
export class ResourcesModule {}
