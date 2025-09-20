import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudflareR2Provider } from './providers/cloudflare.provider';

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudflareR2Provider],
})
export class UploadModule {}
