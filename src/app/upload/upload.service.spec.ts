import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { UploadService } from './upload.service';
import { UploadResponse } from './interfaces/upload.interface';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

describe('UploadService', () => {
  let service: UploadService;
  let configService: ConfigService;
  let r2Client: any;

  const mockFile = {
    fieldname: 'avatar',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024,
  };

  beforeEach(async () => {
    const mockR2Client = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: 'CLOUDFLARE_R2_CLIENT',
          useValue: mockR2Client,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);
    r2Client = module.get('CLOUDFLARE_R2_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadAvatar', () => {
    it('should successfully upload avatar and return URL', async () => {
      // Arrange
      const mockBucket = 'test-bucket';
      const mockPublicUrl = 'https://test.r2.cloudflarestorage.com';

      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce(mockBucket) // CLOUDFLARE_BUCKET
        .mockReturnValueOnce(mockPublicUrl); // CLOUDFLARE_PUBLIC_URL

      r2Client.send.mockResolvedValueOnce({});

      // Act
      const result: UploadResponse = await service.uploadAvatar(mockFile);

      // Assert
      expect(result).toEqual({
        url: `${mockPublicUrl}/avatars/mocked-uuid-123.jpg`,
        message: 'Avatar uploaded successfully',
      });

      expect(r2Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));

      const sentCommand = r2Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(sentCommand.input).toEqual({
        Bucket: mockBucket,
        Key: 'avatars/mocked-uuid-123.jpg',
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
        ContentLength: mockFile.size,
      });
    });

    it('should throw error when bucket configuration is missing', async () => {
      // Arrange
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce(undefined) // CLOUDFLARE_BUCKET missing
        .mockReturnValueOnce('https://test.com'); // CLOUDFLARE_PUBLIC_URL

      // Act & Assert
      await expect(service.uploadAvatar(mockFile)).rejects.toThrow('Cloudflare R2 bucket configuration is missing');

      expect(r2Client.send).not.toHaveBeenCalled();
    });

    it('should throw error when public URL configuration is missing', async () => {
      // Arrange
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('test-bucket') // CLOUDFLARE_BUCKET
        .mockReturnValueOnce(undefined); // CLOUDFLARE_PUBLIC_URL missing

      // Act & Assert
      await expect(service.uploadAvatar(mockFile)).rejects.toThrow('Cloudflare R2 bucket configuration is missing');

      expect(r2Client.send).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when R2 client fails', async () => {
      // Arrange
      const mockBucket = 'test-bucket';
      const mockPublicUrl = 'https://test.r2.cloudflarestorage.com';
      const mockError = new Error('S3 service error');

      jest.spyOn(configService, 'get').mockReturnValueOnce(mockBucket).mockReturnValueOnce(mockPublicUrl);

      r2Client.send.mockRejectedValueOnce(mockError);

      // Act & Assert
      const uploadPromise = service.uploadAvatar(mockFile);

      await expect(uploadPromise).rejects.toThrow(BadRequestException);
      await expect(uploadPromise).rejects.toThrow('Upload failed: S3 service error');
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const mockBucket = 'test-bucket';
      const mockPublicUrl = 'https://test.r2.cloudflarestorage.com';

      jest.spyOn(configService, 'get').mockReturnValueOnce(mockBucket).mockReturnValueOnce(mockPublicUrl);

      r2Client.send.mockRejectedValueOnce('string error');

      // Act & Assert
      const uploadPromise = service.uploadAvatar(mockFile);

      await expect(uploadPromise).rejects.toThrow(BadRequestException);
      await expect(uploadPromise).rejects.toThrow('Upload failed: Unknown error occurred');
    });

    it('should generate correct file path with extension', async () => {
      // Arrange
      const mockBucket = 'test-bucket';
      const mockPublicUrl = 'https://test.r2.cloudflarestorage.com';
      const fileWithPngExtension = {
        ...mockFile,
        originalname: 'test-image.png',
        mimetype: 'image/png',
      };

      jest.spyOn(configService, 'get').mockReturnValueOnce(mockBucket).mockReturnValueOnce(mockPublicUrl);

      r2Client.send.mockResolvedValueOnce({});

      // Act
      const result = await service.uploadAvatar(fileWithPngExtension);

      // Assert
      expect(result.url).toBe(`${mockPublicUrl}/avatars/mocked-uuid-123.png`);

      const sentCommand = r2Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(sentCommand.input.Key).toBe('avatars/mocked-uuid-123.png');
    });
  });
});
