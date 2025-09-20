import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            uploadAvatar: jest.fn(),
          },
        },
        {
          provide: 'CLOUDFLARE_R2_CLIENT',
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload avatar', async () => {
    const mockFile = {
      fieldname: 'avatar',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as any;

    const expectedResult = {
      url: 'https://example.com/avatars/test.jpg',
      message: 'Avatar uploaded successfully',
    };

    jest.spyOn(service, 'uploadAvatar').mockResolvedValue(expectedResult);

    const result = await controller.uploadAvatar(mockFile);

    expect(result).toEqual(expectedResult);
    expect(service.uploadAvatar).toHaveBeenCalledWith(mockFile);
  });
});
