import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TEMPLATE_REPOSITORY } from '../domain/constants/template.constants';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { Template } from '../domain/entities/template.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { FieldData } from '../domain/interfaces/field.interface';
import { Field } from '../domain/entities/fields/field.entity';
import { FieldRequestDto } from './dto/field-request.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { FieldResponseDto } from './dto/field-response.dto';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at Template operation. Try again, later.';
const NOT_FOUND_MESSAGE = 'Template not found.';

@Injectable()
export class TemplatesService {
  constructor(@Inject(TEMPLATE_REPOSITORY) private readonly repository: ITemplateRepository) {}

  async create(request: CreateTemplateDto): Promise<TemplateResponseDto> {
    const template = new Template('', request.title, this.mapFields(request.fields));

    const response = await this.repository.create(template);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async findAll(): Promise<TemplateResponseDto[]> {
    const response = await this.repository.findAll();

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response.map(template => this.mapToDto(template));
  }

  async findOne(id: string): Promise<TemplateResponseDto> {
    const response = await this.repository.findById(id);

    if (!response) throw new NotFoundException(NOT_FOUND_MESSAGE);

    return this.mapToDto(response);
  }

  async update(id: string, request: UpdateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.repository.findById(id);

    if (!template) throw new NotFoundException(NOT_FOUND_MESSAGE);

    template.title = request.title || template.title;
    template.fields = request.fields ? this.mapFields(request.fields) : template.fields;

    const response = await this.repository.update(id, template);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  async delete(id: string): Promise<boolean> {
    const template = await this.repository.findById(id);

    if (!template) throw new NotFoundException(NOT_FOUND_MESSAGE);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  private mapFields(fields: FieldRequestDto[]): Field[] {
    return fields.map(field => {
      const fieldData: FieldData = this.mapToFieldData(field);

      return FieldFactory.create(fieldData);
    });
  }

  private mapToFieldData(field: FieldRequestDto): FieldData {
    return {
      id: field.id || '',
      title: field.title,
      type: field.type,
      key: field.key,
      value: field.value,
      resourceId: field.resourceId,
      fields: field.fields ? field.fields.map(child => this.mapToFieldData(child)) : undefined,
    };
  }

  private mapToDto(template: Template): TemplateResponseDto {
    return new TemplateResponseDto(
      template.id,
      template.title,
      template.fields.map(field => new FieldResponseDto(field.id, field.title, field.type)),
    );
  }
}
