import { Injectable } from '@nestjs/common';
import { System } from '../entities/system.entity';
import { ISystemRepository } from './interface/system.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SystemDocument, SystemMongoSchema } from '../schemas/system.schema';
import { Model } from 'mongoose';

@Injectable()
export class SystemRepository implements ISystemRepository {
  constructor(@InjectModel(SystemMongoSchema.name) private readonly systemModel: Model<SystemDocument>) {}

  findById(id: string): Promise<System> {
    throw new Error('Method not implemented.' + id);
  }
  findAll(): Promise<System> {
    throw new Error('Method not implemented.');
  }
  create(system: System): Promise<System> {
    throw new Error('Method not implemented.');
  }
  update(id: string, system: Partial<System>): Promise<System> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
