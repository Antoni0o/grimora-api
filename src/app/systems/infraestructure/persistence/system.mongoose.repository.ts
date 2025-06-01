import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { System } from '../../domain/entities/system.entity';
import { ISystemRepository } from '../../domain/repositories/system.repository.interface';
import { SystemDocument, SystemMongoSchema } from './system.schema';
import { SystemMapper } from './system.mapper';

@Injectable()
export class SystemRepository implements ISystemRepository {
  constructor(@InjectModel(SystemMongoSchema.name) private readonly systemModel: Model<SystemDocument>) {}

  async findById(id: string): Promise<System | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const system = await this.systemModel.findById(id).exec();

    if (!system) return null;

    return SystemMapper.toDomain(system);
  }

  async findAll(): Promise<System[] | null> {
    const systems = await this.systemModel.find();

    if (!systems) return null;

    return systems.map(system => SystemMapper.toDomain(system));
  }

  async create(system: System): Promise<System | null> {
    const createdSystem = await this.systemModel.create({
      title: system.title,
      creatorId: system.creatorId,
      resources: system.resourceIds,
      template: system.templateId,
    });

    if (!createdSystem) return null;

    return SystemMapper.toDomain(createdSystem);
  }

  async update(id: string, system: Partial<System>): Promise<System | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updatedSystem = await this.systemModel.findByIdAndUpdate(id, system, { new: true }).exec();

    if (!updatedSystem) return null;

    return SystemMapper.toDomain(updatedSystem);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedSystem = await this.systemModel.findByIdAndDelete(id).exec();

    if (!deletedSystem) return false;

    return true;
  }
}
