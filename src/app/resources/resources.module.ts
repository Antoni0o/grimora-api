import { Module } from '@nestjs/common';
import { ResourcesService } from './application/resources.service';
import { ResourcesController } from './application/resources.controller';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
