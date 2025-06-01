import { System } from '../../entities/system.entity';

export interface ISystemRepository {
  findById(id: string): Promise<System>;
  findAll(): Promise<System>;
  create(system: System): Promise<System>;
  update(id: string, system: Partial<System>): Promise<System>;
  delete(id: string): Promise<boolean>;
}
