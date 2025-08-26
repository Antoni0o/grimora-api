import { Injectable } from '@nestjs/common';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { Template } from '../domain/entities/template.entity';
import { InjectModel } from '@nestjs/mongoose';
import { TemplateDocument, TemplateMongoSchema } from './template.schema';
import { Model, Types } from 'mongoose';
import { TemplateMapper } from './template.mapper';

@Injectable()
export class TemplatesRepository implements ITemplateRepository {
  constructor(@InjectModel(TemplateMongoSchema.name) private readonly templateModel: Model<TemplateDocument>) {}

  async findAll(): Promise<Template[] | null> {
    const templates = await this.templateModel.find();

    if (!templates) return null;

    return templates.map(template => TemplateMapper.templateToDomain(template));
  }

  async findById(id: string): Promise<Template | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const template = await this.templateModel.findById(TemplateMapper.toObjectId(id)).exec();

    if (!template) return null;

    return TemplateMapper.templateToDomain(template);
  }

  async create(template: Template): Promise<Template | null> {
    const createdTemplate = await this.templateModel.create({
      title: template.title,
      fields: template.fields,
    });

    if (!createdTemplate) return null;

    return TemplateMapper.templateToDomain(createdTemplate);
  }

  async update(id: string, template: Template): Promise<Template | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const templateToUpdate = await this.templateModel
      .findByIdAndUpdate(
        id,
        {
          title: template.title,
          fields: template.fields,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!templateToUpdate) return null;

    return TemplateMapper.templateToDomain(templateToUpdate);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const deletedResource = await this.templateModel.findByIdAndDelete(id).exec();

    if (!deletedResource) return false;

    return true;
  }
}
