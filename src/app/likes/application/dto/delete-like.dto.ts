import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteLikeDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsString()
  @IsNotEmpty()
  entityType!: string;
}
