import { System } from '../../domain/entities/system.entity';

export interface ISystemRepository {
  findById(id: string): Promise<System | null>;
  findAll(): Promise<System[] | null>;
  create(system: System): Promise<System | null>;
  update(id: string, system: Partial<System>): Promise<System | null>;
  delete(id: string): Promise<boolean>;
}
