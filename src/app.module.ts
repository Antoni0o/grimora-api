import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesModule } from './app/templates/templates.module';
import { SheetsModule } from './app/sheets/sheets.module';
import { ResourcesModule } from './app/resources/resources.module';
import { SystemsModule } from './app/systems/systems.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRoot(auth),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    TemplatesModule,
    SheetsModule,
    SystemsModule,
    ResourcesModule,
  ],
})
export class AppModule {}
