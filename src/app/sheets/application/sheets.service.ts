import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { ISheetsRepository } from '../domain/repositories/sheets.repository.interface';
import { SHEETS_REPOSITORY } from '../domain/constants/sheets.constants';
import { Sheet } from '../domain/entities/sheet.entity';
import {
  SheetResponseDto,
  SheetPopulatedResponseDto,
  TemplatePopulatedResponseDto,
  FieldPopulatedResponseDto,
} from './dto/sheet-response.dto';
import { Template } from 'src/app/templates/domain/entities/template.entity';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal Error at Sheet operation. Try again, later.';
const BAD_REQUEST_MESSAGE = 'Requester is not the Owner.';
const NOT_FOUND_MESSAGE = 'Sheet not found.';

@Injectable()
export class SheetsService {
  constructor(@Inject(SHEETS_REPOSITORY) private readonly repository: ISheetsRepository) {}

  async create(request: CreateSheetDto): Promise<SheetResponseDto> {
    const sheet = new Sheet('', request.title, request.ownerId, this.mapTemplateIdToTemplate(request), request.values);

    if (request.ownerSheetsCount >= request.ownerSheetsLimit) {
      throw new BadRequestException("Owner's sheets limit reached.");
    }

    const response = await this.repository.create(sheet);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async findAll(): Promise<SheetResponseDto[]> {
    const sheets = await this.repository.findAll();

    if (!sheets) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return sheets.map(sheet => this.mapToDto(sheet));
  }

  async findByOwnerId(ownerId: string): Promise<SheetResponseDto[]> {
    const sheets = await this.repository.findByOwnerId(ownerId);

    if (!sheets) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return sheets.map(sheet => this.mapToDto(sheet));
  }

  async findOne(id: string): Promise<SheetPopulatedResponseDto> {
    const sheet = await this.repository.findById(id);

    if (!sheet) throw new NotFoundException(NOT_FOUND_MESSAGE);

    return this.mapToPopulatedDto(sheet);
  }

  async update(id: string, request: UpdateSheetDto): Promise<SheetResponseDto> {
    const sheet = await this.repository.findById(id);

    if (!sheet) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (request.requesterId !== sheet?.ownerId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    sheet.values = request.values;
    sheet.title = request.title;

    const response = await this.repository.update(id, sheet);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return this.mapToDto(response);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const sheet = await this.repository.findById(id);

    if (!sheet) throw new NotFoundException(NOT_FOUND_MESSAGE);

    if (userId !== sheet?.ownerId) throw new BadRequestException(BAD_REQUEST_MESSAGE);

    const response = await this.repository.delete(id);

    if (!response) throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);

    return response;
  }

  private mapToDto(response: Sheet): SheetResponseDto {
    return new SheetResponseDto(response.id, response.title, response.ownerId, response.template.id, response.values);
  }

  private mapToPopulatedDto(response: Sheet): SheetPopulatedResponseDto {
    return new SheetPopulatedResponseDto(
      response.id,
      response.title,
      response.ownerId,
      this.mapTemplateToPopulatedDto(response.template),
      response.values,
    );
  }

  private mapTemplateToPopulatedDto(template: Template): TemplatePopulatedResponseDto {
    return new TemplatePopulatedResponseDto(
      template.id,
      template.title,
      template.fields.map(field => this.mapFieldToPopulatedDto(field)),
    );
  }

  private mapFieldToPopulatedDto(field: any): FieldPopulatedResponseDto {
    return new FieldPopulatedResponseDto(
      field.id,
      field.title,
      field.type,
      field.fields?.map((subField: any) => this.mapFieldToPopulatedDto(subField)) ?? [],
      field.key,
      field.value,
      field.resourceId,
    );
  }

  private mapTemplateIdToTemplate(request: CreateSheetDto) {
    return new Template(request.templateId, '', []);
  }
}
