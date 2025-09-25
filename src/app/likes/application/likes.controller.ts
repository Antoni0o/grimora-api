import { Controller, Post, Delete, Get, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { LikeCountRequestDto } from './dto/like-count-request.dto';
import { LikeCountResponseDto } from './dto/like-count-response.dto';
import { UserLikesByEntityRequestDto } from './dto/user-likes-by-entity-request.dto';
import { UserLikesByEntityResponseDto } from './dto/user-likes-by-entity-response.dto';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';

@UseGuards(AuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addLike(@Body() request: CreateLikeDto, @Session() session: UserSession): Promise<void> {
    request.userId = session.user.id;
    await this.likesService.addLike(request.userId, request.entityId, request.entityType);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLike(@Body() request: DeleteLikeDto, @Session() session: UserSession): Promise<void> {
    request.userId = session.user.id;
    await this.likesService.deleteLike(request.userId, request.entityId, request.entityType);
  }

  @Get('count')
  async getLikeCount(@Query() query: LikeCountRequestDto): Promise<LikeCountResponseDto> {
    return this.likesService.getLikeCount(query.entityId, query.entityType);
  }

  @Get('user/me')
  async getUserEntityLikes(
    @Query() query: UserLikesByEntityRequestDto,
    @Session() session: UserSession,
  ): Promise<UserLikesByEntityResponseDto> {
    query.userId = session.user.id;
    const entityIds = await this.likesService.getAllUserLikesForEntityType(query.userId, query.entityType);
    return new UserLikesByEntityResponseDto(entityIds);
  }
}
