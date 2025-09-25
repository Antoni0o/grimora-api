export class Like {
  id!: string;
  userId: string;
  entityId: string;
  entityType: string;
  createdAt: Date;

  constructor(userId: string, entityId: string, entityType: string) {
    this.userId = userId;
    this.entityId = entityId;
    this.entityType = entityType;
    this.createdAt = new Date();
  }
}
