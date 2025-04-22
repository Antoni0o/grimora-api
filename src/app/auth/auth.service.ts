import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import JwtPayloadModel from './models/jwt-payload.model';
import { CreateUserService } from '../users/services/create/create-user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private createUserService: CreateUserService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.createUserService.create({
      email,
      password: hashedPassword,
      name,
    });
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const isPassValid = await bcrypt.compare(password, user.password || '');

    if (!user || (user.password && !isPassValid)) throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayloadModel = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    await this.usersService.saveRefreshToken(user.id, refreshToken);

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

      const user = await this.usersService.findById(payload.sub);

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
