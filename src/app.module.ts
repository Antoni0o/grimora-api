import { Module } from '@nestjs/common';
import { SystemModule } from './app/system/system.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [SystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
