import { Sheet } from '../entities/sheet.entity';

export interface ISheetsRepository {
  findById(id: string): Promise<Sheet | null>;
  findAll(): Promise<Sheet[] | null>;
  findByOwnerId(ownerId: string): Promise<Sheet[] | null>;
  create(system: Sheet): Promise<Sheet | null>;
  update(id: string, system: Partial<Sheet>): Promise<Sheet | null>;
  delete(id: string): Promise<boolean>;
}
