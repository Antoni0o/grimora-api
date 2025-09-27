import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TEMPLATES_REPOSITORY } from '../domain/constants/template.constants';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { Template } from '../domain/entities/template.entity';
import { FieldData } from '../domain/interfaces/field.interface';
import { FieldRequestDto } from './dto/field-request.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { FieldResponseDto } from './dto/field-response.dto';
import { TemplateDomainError, TemplateDomainResult } from '../domain/types/template-domain-result.types';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at Template operation. Try again, later.';
const NOT_FOUND_MESSAGE = 'Template not found.';

@Injectable()
export class TemplatesService {
  constructor(@Inject(TEMPLATES_REPOSITORY) private readonly repository: ITemplateRepository) {}

  async create(request: CreateTemplateDto): Promise<TemplateResponseDto> {
    const template = new Template('', request.title, [], [], []);
    this.addFields(request.fields, template);

    const response = await this.repository.create(template);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  private addFields(fields: FieldRequestDto[], template: Template): void {
    fields.forEach(field => {
      const fieldData: FieldData = this.mapToFieldData(field);

      const result = template.addField(fieldData);

      if (result.error !== TemplateDomainError.None) {
        throw new BadRequestException(this.getDomainErrorMessage(result.error));
      }
    });
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
    const existingTemplate = await this.repository.findById(id);

    if (!existingTemplate) throw new NotFoundException(NOT_FOUND_MESSAGE);

    const updatedTemplate = new Template(
      existingTemplate.id,
      request.title,
      existingTemplate.fields,
      existingTemplate.usedColumns,
      existingTemplate.usedRows,
    );

    this.updateFields(request.fields, updatedTemplate);

    const response = await this.repository.update(id, updatedTemplate);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  private updateFields(fields: FieldRequestDto[], template: Template): void {
    const errors: string[] = [];

    fields.forEach(field => {
      const fieldData: FieldData = this.mapToFieldData(field);

      let result: TemplateDomainResult;

      if (!field.id) {
        result = template.addField(fieldData);
      } else {
        result = template.updateField(field.id, fieldData);
      }

      if (result.error !== TemplateDomainError.None) {
        errors.push(this.getDomainErrorMessage(result.error));
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(`Field operations failed: ${errors.join(', ')}`);
    }
  }

  private getDomainErrorMessage(error: TemplateDomainError): string {
    switch (error) {
      case TemplateDomainError.ColumnLimitExceeded:
        return 'Column limit exceeded';
      case TemplateDomainError.RowLimitExceeded:
        return 'Row limit exceeded';
      case TemplateDomainError.CommonFieldSlotConflict:
        return 'Field slot conflict';
      case TemplateDomainError.GroupFieldSlotConflict:
        return 'Group field slot conflict';
      case TemplateDomainError.FieldNotFound:
        return 'Field not found';
      default:
        return 'Unknown field error';
    }
  }

  async delete(id: string): Promise<boolean> {
    const template = await this.repository.findById(id);

    if (!template) throw new NotFoundException(NOT_FOUND_MESSAGE);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
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
      columns: field.columns,
      rows: field.rows,
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
