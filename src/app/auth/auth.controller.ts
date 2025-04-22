import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import AuthRequestModel from './models/auth-request.model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: AuthRequestModel) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: AuthRequestModel) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
