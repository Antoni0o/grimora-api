import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from './interfaces/upload.interface';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDFLARE_R2_CLIENT') private readonly r2Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadAvatar(file: any): Promise<UploadResponse> {
    const bucket = this.configService.get<string>('CLOUDFLARE_BUCKET');
    const publicUrl = this.configService.get<string>('CLOUDFLARE_PUBLIC_URL');

    if (!bucket || !publicUrl) {
      throw new Error('Cloudflare R2 bucket configuration is missing');
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `avatars/${uuidv4()}.${fileExtension}`;

    try {
      // Upload para Cloudflare R2
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      });

      await this.r2Client.send(command);

      // Retornar URL pública
      const fileUrl = `${publicUrl}/${fileName}`;

      return {
        url: fileUrl,
        message: 'Avatar uploaded successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }
}
