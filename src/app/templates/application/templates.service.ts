import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TEMPLATE_REPOSITORY } from '../domain/constants/template.constants';
import { ITemplateRepository } from '../domain/repositories/template.repository';
import { Template } from '../domain/entities/template.entity';
import { FieldFactory } from '../domain/factories/field.factory';
import { FieldData } from '../domain/interfaces/field.interface';
import { Field } from '../domain/entities/fields/field.entity';
import { CreateFieldDto } from './dto/create-field.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { FieldResponseDto } from './dto/field-response.dto';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at RPG Template creation. Try again, later.';
const BAD_REQUEST_MESSAGE = 'Requester is not the Creator.';
const NOT_FOUND_MESSAGE = 'System not found.';

@Injectable()
export class TemplatesService {
  constructor(@Inject(TEMPLATE_REPOSITORY) private readonly repository: ITemplateRepository) { }

  async create(request: CreateTemplateDto): Promise<TemplateResponseDto> {
    const template = new Template('', request.title, this.mapFields(request));

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

  update(id: number, updateTemplateDto: UpdateTemplateDto) {
    return `This action updates a #${id} template`;
  }

  remove(id: number) {
    return `This action removes a #${id} template`;
  }

  private mapFields(request: CreateTemplateDto): Field[] {
    return request.fields.map(field => {
      const fieldData: FieldData = this.mapFieldData(field);

      return FieldFactory.create(fieldData);
    });
  }

  private mapFieldData(field: CreateFieldDto): FieldData {
    return {
      id: '',
      title: field.title,
      type: field.type,
      key: field.key,
      value: field.value,
      resourceId: field.resourceId,
      fields: field.fields ? field.fields.map(child => this.mapFieldData(child)) : undefined
    };
  }

  private mapToDto(template: Template): TemplateResponseDto {
    return new TemplateResponseDto(
      template.id,
      template.title,
      template.fields.map(field => new FieldResponseDto(field.id, field.title, field.type))
    );
  }
}
