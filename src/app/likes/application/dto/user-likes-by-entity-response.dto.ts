export class UserLikesByEntityResponseDto {
  entityIds: string[];

  constructor(entityIds: string[]) {
    this.entityIds = entityIds;
  }
}
