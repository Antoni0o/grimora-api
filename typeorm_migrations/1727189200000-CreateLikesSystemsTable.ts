import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateLikesSystemsTable1727189200000 implements MigrationInterface {
  name = 'CreateLikesSystemsTable1727189200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'likes_systems',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_likes_systems_entity',
            columnNames: ['entity_id', 'entity_type'],
          },
        ],
        uniques: [
          {
            name: 'UQ_likes_systems_user_entity',
            columnNames: ['user_id', 'entity_id', 'entity_type'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('likes_systems');
  }
}
