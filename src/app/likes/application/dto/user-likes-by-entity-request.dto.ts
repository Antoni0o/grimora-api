import { IsString, IsNotEmpty } from 'class-validator';

export class UserLikesByEntityRequestDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  entityType!: string;
}
