import { Module } from '@nestjs/common';
import { SystemsService } from './application/systems.service';
import { SystemsController } from './application/systems.controller';

@Module({
  controllers: [SystemsController],
  providers: [SystemsService],
})
export class SystemsModule {}
