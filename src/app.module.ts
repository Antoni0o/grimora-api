import { Module } from '@nestjs/common';
import { UploadModule } from './app/upload/upload.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesModule } from './app/templates/templates.module';
import { SheetsModule } from './app/sheets/sheets.module';
import { ResourcesModule } from './app/resources/resources.module';
import { SystemsModule } from './app/systems/systems.module';
import { LikesModule } from './app/likes/likes.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { BffModule } from './bff/bff.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UploadModule,
    TemplatesModule,
    SheetsModule,
    SystemsModule,
    ResourcesModule,
    LikesModule,
    AuthModule.forRoot(auth),
    BffModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
