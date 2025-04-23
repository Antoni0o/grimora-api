import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserService } from '../users/services/create/create-user.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import FindUserService from '../users/services/find/find-user.service';
import RefreshTokenService from '../users/services/refresh-token/refresh-token.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CreateUserService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: FindUserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
