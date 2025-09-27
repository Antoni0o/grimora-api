import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../../domain/enums/field-type.enum';
import { PositionDto } from './position.dto';

export class FieldRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsEnum(FieldType)
  type: FieldType;

  @IsMongoId()
  @IsOptional()
  id?: string;

  @IsArray()
  @IsOptional()
  fields?: FieldRequestDto[];

  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  resourceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  @IsNotEmpty()
  positions: PositionDto[];

  constructor(
    title: string,
    type: FieldType,
    positions: PositionDto[],
    id?: string,
    fields?: FieldRequestDto[],
    key?: string,
    value?: string,
    resourceId?: string,
  ) {
    this.title = title;
    this.type = type;
    this.id = id;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.resourceId = resourceId;
    this.positions = positions;
  }
}
