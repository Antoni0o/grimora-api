import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import JwtPayloadModel from './models/jwt-payload.model';
import { CreateUserService } from '../users/services/create/create-user.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { generateConfirmEmailTemplate } from '../email/templates/confirm-email.template';
import FindUserService from '../users/services/find/find-user.service';
import RefreshTokenService from '../users/services/refresh-token/refresh-token.service';
import UserRequestModel from '../users/models/user-request.model';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private findUserService: FindUserService,
    private refreshTokenService: RefreshTokenService,
    private createUserService: CreateUserService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const user = await this.createUserService.create(new UserRequestModel({ email, password, name }));

    const appUrl = this.configService.get<string>('APP_URL');
    const mail = generateConfirmEmailTemplate(user.verificationToken!, appUrl!);

    await this.emailService.sendMail(email, 'Confirm your e-mail', mail);

    return { message: 'User registered successfully. Verify your e-mail!' };
  }

  async login(email: string, password: string) {
    const user = await this.findUserService.findByEmail(email);
    const isPassValid = await bcrypt.compare(password, user.password || '');

    if (user && !user.isVerified) throw new UnauthorizedException('User is not verified');

    if (!user || (user.password && !isPassValid)) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayloadModel = { sub: user.id, email: user.email, refreshToken: user.refreshToken || '' };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    await this.refreshTokenService.set(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: JwtPayloadModel = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.findUserService.findById(payload.sub);

      if (!user) throw new UnauthorizedException();

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
