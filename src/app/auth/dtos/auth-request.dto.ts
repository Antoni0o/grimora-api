// auth-request.dto.ts
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class AuthRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @Length(2, 32)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
