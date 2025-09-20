import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from './file-validation.pipe';

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    pipe = new FileValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should accept valid JPEG file', () => {
      const validJpegFile = {
        fieldname: 'avatar',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024 * 1024, // 1MB
      };

      const result = pipe.transform(validJpegFile);

      expect(result).toEqual(validJpegFile);
    });

    it('should accept valid PNG file', () => {
      const validPngFile = {
        fieldname: 'avatar',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image-data'),
        size: 1024 * 1024, // 1MB
      };

      const result = pipe.transform(validPngFile);

      expect(result).toEqual(validPngFile);
    });

    it('should accept valid WebP file', () => {
      const validWebpFile = {
        fieldname: 'avatar',
        originalname: 'test.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        buffer: Buffer.from('fake-image-data'),
        size: 1024 * 1024, // 1MB
      };

      const result = pipe.transform(validWebpFile);

      expect(result).toEqual(validWebpFile);
    });

    it('should accept file at maximum size limit (2MB)', () => {
      const fileTwoMB = {
        fieldname: 'avatar',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 2 * 1024 * 1024, // Exactly 2MB
      };

      const result = pipe.transform(fileTwoMB);

      expect(result).toEqual(fileTwoMB);
    });

    it('should throw BadRequestException when no file is uploaded', () => {
      expect(() => {
        pipe.transform(null);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(null);
      }).toThrow('No file uploaded');
    });

    it('should throw BadRequestException when file is undefined', () => {
      expect(() => {
        pipe.transform(undefined);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(undefined);
      }).toThrow('No file uploaded');
    });

    it('should throw BadRequestException for invalid file type (PDF)', () => {
      const invalidFile = {
        fieldname: 'avatar',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data'),
        size: 1024,
      };

      expect(() => {
        pipe.transform(invalidFile);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(invalidFile);
      }).toThrow('Invalid file type. Only JPEG, PNG and WebP are allowed');
    });

    it('should throw BadRequestException for invalid file type (GIF)', () => {
      const invalidFile = {
        fieldname: 'avatar',
        originalname: 'animated.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        buffer: Buffer.from('fake-gif-data'),
        size: 1024,
      };

      expect(() => {
        pipe.transform(invalidFile);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(invalidFile);
      }).toThrow('Invalid file type. Only JPEG, PNG and WebP are allowed');
    });

    it('should throw BadRequestException for file size exceeding 2MB', () => {
      const largeFile = {
        fieldname: 'avatar',
        originalname: 'large-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-large-image-data'),
        size: 3 * 1024 * 1024, // 3MB
      };

      expect(() => {
        pipe.transform(largeFile);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(largeFile);
      }).toThrow('File size too large. Maximum size is 2MB');
    });

    it('should throw BadRequestException for file size just over 2MB', () => {
      const oversizedFile = {
        fieldname: 'avatar',
        originalname: 'slightly-large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 2 * 1024 * 1024 + 1, // 2MB + 1 byte
      };

      expect(() => {
        pipe.transform(oversizedFile);
      }).toThrow(BadRequestException);

      expect(() => {
        pipe.transform(oversizedFile);
      }).toThrow('File size too large. Maximum size is 2MB');
    });

    it('should handle edge case with very small valid file', () => {
      const tinyFile = {
        fieldname: 'avatar',
        originalname: 'tiny.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('x'),
        size: 1, // 1 byte
      };

      const result = pipe.transform(tinyFile);

      expect(result).toEqual(tinyFile);
    });
  });
});
