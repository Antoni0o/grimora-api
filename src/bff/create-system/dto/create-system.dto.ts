import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateResourceDto } from 'src/app/resources/application/dto/create-resource.dto';
import { CreateTemplateDto } from 'src/app/templates/application/dto/create-template.dto';

export class BffCreateSystemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  resources: CreateResourceDto[];

  @IsArray()
  @IsNotEmpty()
  templates: CreateTemplateDto[];

  constructor(title: string, description: string, resources: CreateResourceDto[], templates: CreateTemplateDto[]) {
    this.title = title;
    this.description = description;
    this.resources = resources;
    this.templates = templates;
  }
}
