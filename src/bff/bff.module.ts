import { Module } from '@nestjs/common';
import { ResourcesModule } from 'src/app/resources/resources.module';
import { SystemsModule } from 'src/app/systems/systems.module';
import { TemplatesModule } from 'src/app/templates/templates.module';
import { BffController } from './bff.controller';

@Module({
  imports: [SystemsModule, ResourcesModule, TemplatesModule],
  controllers: [BffController],
})
export class BffModule {}
