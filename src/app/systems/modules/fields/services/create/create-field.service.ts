import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import CreateFieldDto from '../../dtos/create-field.dto';
import Field from '../../field.entity';
import FieldTypeService, { MongooseFieldTypeModel } from '../../../field-types/field-type.service';
import CreateFieldMapper from './create-field.mapper';
import CreateFieldRequest from '../../models/create-field.request';
import CreateFieldResponse from '../../models/create-field.response';

@Injectable()
export default class CreateFieldService {
  private fieldTypeIds: Array<Types.ObjectId> = [];
  private fieldsToCreate: Array<CreateFieldRequest> = [];

  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @Inject(FieldTypeService) private fieldTypeService: FieldTypeService,
    @Inject(CreateFieldMapper) private mapper: CreateFieldMapper,
  ) {}

  async create(request: CreateFieldDto): Promise<Array<CreateFieldResponse>> {
    await this.createFields(request);

    await this.fieldModel.create(this.fieldsToCreate);

    return this.fieldsToCreate.map(field => this.mapper.mapRequestToResponse(field));
  }

  private async createFields(request: CreateFieldDto): Promise<void> {
    const fieldType = await this.findFieldType(request.typeId);

    const field = this.mapper.mapDtoToRequest(request, fieldType._id);

    const childrens = await this.createChildren(request);
    field.childrenIds = childrens.length > 0 ? childrens.map(children => children._id) : [];

    this.fieldsToCreate.push(field);
  }

  private async createChildren(field: CreateFieldDto): Promise<Array<CreateFieldRequest>> {
    const children: Array<CreateFieldRequest> = [];

    if (!field.children || field.children.length === 0) return children;

    for (const child of field.children) {
      const cacheTypeId = this.fieldTypeIds.find(id => id.toString() === child.typeId);
      const fieldTypeId = cacheTypeId ?? (await this.findFieldType(child.typeId))._id;

      const childRequest = this.mapper.mapDtoToRequest(child, fieldTypeId);

      const grandChildren = await this.createChildren(child);

      childRequest.childrenIds = grandChildren.length > 0 ? grandChildren.map(grandChild => grandChild._id) : [];

      children.push(childRequest);
    }

    this.fieldsToCreate.push(...children);
    return children;
  }

  private async findFieldType(typeId: string): Promise<MongooseFieldTypeModel> {
    const fieldType = await this.fieldTypeService.find(typeId);
    this.fieldTypeIds.push(fieldType._id);
    return fieldType;
  }
}
