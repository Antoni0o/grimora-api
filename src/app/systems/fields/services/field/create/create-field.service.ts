import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import CreateFieldDto from '../../../dtos/create-field.dto';
import Field from '../../../entities/field.entity';
import FieldTypeService from '../../field-type/field-type.service';

@Injectable()
export default class CreateFieldService {
  private fieldTypeIds: Array<string> = [];
  private fieldsToCreate: Array<CreateFieldDto> = [];
  private request?: CreateFieldDto;

  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @Inject(FieldTypeService) private fieldTypeService: FieldTypeService,
  ) {}

  async create(request: CreateFieldDto) {
    this.request = request;

    await this.createFields();

    return await this.fieldModel.create(this.fieldsToCreate);
  }

  private async createFields() {
    if (!this.request) throw new BadRequestException('Request is not filled');

    await this.fieldTypeService.find(this.request.typeId);
    this.fieldTypeIds.push(this.request.typeId);

    const fieldId = new Types.ObjectId();
    const field = new CreateFieldDto();
    field._id = fieldId;

    this.setValues(field, this.request);

    const childrens = await this.createChildren(this.request);
    field.childrenIds = childrens.length > 0 ? childrens.map(children => children._id!) : [];

    this.fieldsToCreate.push(field);
  }

  private async createChildren(field: CreateFieldDto): Promise<Array<CreateFieldDto>> {
    const children: Array<CreateFieldDto> = [];

    if (field.children && field.children.length > 0) {
      for (const child of field.children) {
        if (!this.fieldTypeIds.find(typeId => typeId === child.typeId)) {
          await this.fieldTypeService.find(child.typeId);
          this.fieldTypeIds.push(child.typeId);
        }

        const childId = new Types.ObjectId();
        child._id = childId;

        const grandChildren = await this.createChildren(child);

        child.childrenIds = grandChildren.length > 0 ? grandChildren.map(grandChild => grandChild._id!) : [];

        children.push(child);
      }
    }

    this.fieldsToCreate.push(...children);
    return children;
  }

  private setValues(field: CreateFieldDto, values: CreateFieldDto) {
    const fieldKey = this.createKey(values.name);

    field.name = values.name;
    field.typeId = values.typeId;
    field.key = fieldKey;
    field.description = values.description;
    field.config = values.config;
    field.readonly = values.readonly;
    field.required = values.required;
    field.value = values.value;
  }

  private createKey(name: string) {
    return name.replace(/\s+/g, '_').toLowerCase();
  }
}
