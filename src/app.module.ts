import { Module } from '@nestjs/common';
import { UploadModule } from './app/upload/upload.module';
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
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    UploadModule,
    TemplatesModule,
    SheetsModule,
    SystemsModule,
    ResourcesModule,
    AuthModule.forRoot(auth),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
