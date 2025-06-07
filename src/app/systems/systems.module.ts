import { Module } from '@nestjs/common';
import { SystemsService } from './application/systems.service';
import { SystemsController } from './application/systems.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemMongoSchema, SystemSchema } from './infraestructure/persistence/system.schema';
import { SYSTEM_REPOSITORY } from './domain/constants/system.constants';
import { SystemRepository } from './infraestructure/persistence/system.mongoose.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemMongoSchema.name, schema: SystemSchema }]),
    AuthModule
  ],
  controllers: [SystemsController],
  providers: [
    SystemsService,
    {
      provide: SYSTEM_REPOSITORY,
      useClass: SystemRepository,
    },
  ],
})
export class SystemsModule { }
