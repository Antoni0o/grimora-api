import { Module } from '@nestjs/common';
import { ResourcesModule } from 'src/app/resources/resources.module';
import { SystemsModule } from 'src/app/systems/systems.module';
import { TemplatesModule } from 'src/app/templates/templates.module';
import { CreateSystemBffController } from './create-system/create-system.bff.controller';

@Module({
  imports: [SystemsModule, ResourcesModule, TemplatesModule],
  controllers: [CreateSystemBffController],
})
export class BffModule { }
