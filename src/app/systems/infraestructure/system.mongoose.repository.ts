import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { System } from '../domain/entities/system.entity';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { SystemDocument, SystemMongoSchema } from './system.schema';
import { SystemMapper } from './system.mapper';

@Injectable()
export class SystemRepository implements ISystemRepository {
  constructor(@InjectModel(SystemMongoSchema.name) private readonly systemModel: Model<SystemDocument>) {}

  async findById(id: string): Promise<System | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const system = await this.systemModel.findById(id).populate('templates').populate('resources').exec();

    if (!system) return null;

    return SystemMapper.toDomain(system);
  }

  async findAll(): Promise<System[] | null> {
    const systems = await this.systemModel.find().exec();

    if (!systems) return null;

    return systems.map(system => SystemMapper.toDomain(system));
  }

  async findByTitle(title: string): Promise<System[] | null> {
    const systems = await this.systemModel
      .find({
        title: { $regex: title, $options: 'i' },
      })
      .exec();

    if (!systems) return null;

    return systems.map(system => SystemMapper.toDomain(system));
  }

  async findByCreatorId(creatorId: string): Promise<System[] | null> {
    const systems = await this.systemModel.find({ creatorId }).exec();

    if (!systems) return null;

    return systems.map(system => SystemMapper.toDomain(system));
  }

  async create(system: System): Promise<System | null> {
    const createdSystem = await this.systemModel.create({
      title: system.title,
      creatorId: system.creatorId,
      resources: this.getResourceIds(system),
      templates: this.getTemplateIds(system),
    });

    if (!createdSystem) return null;

    return SystemMapper.toDomain(createdSystem);
  }

  async update(id: string, system: System): Promise<System | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const systemToUpdate = await this.systemModel
      .findByIdAndUpdate(
        id,
        {
          title: system.title,
          resources: this.getResourceIds(system),
          templates: this.getTemplateIds(system),
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!systemToUpdate) return null;

    return SystemMapper.toDomain(systemToUpdate);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedSystem = await this.systemModel.findByIdAndDelete(id).exec();

    if (!deletedSystem) return false;

    return true;
  }

  private getResourceIds(system: System) {
    return system.resources ? system.resources.map(resource => new Types.ObjectId(resource.id)) : [];
  }

  private getTemplateIds(system: System) {
    return system.templates.map(template => new Types.ObjectId(template.id));
  }
}
