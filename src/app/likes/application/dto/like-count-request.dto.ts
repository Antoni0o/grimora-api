import { IsString, IsNotEmpty } from 'class-validator';

export class LikeCountRequestDto {
  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsString()
  @IsNotEmpty()
  entityType!: string;
}
