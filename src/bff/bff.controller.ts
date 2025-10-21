import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ResourcesService } from '../app/resources/application/resources.service';
import { TemplatesService } from '../app/templates/application/templates.service';
import { SystemsService } from '../app/systems/application/systems.service';
import { BffCreateSystemDto } from './dto/create-system.dto';
import { SystemResponseDto } from '../app/systems/application/dto/system-response.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import { UserSession } from '../lib/auth';

/*
TO-DOS: 
  Ajustar nomes de classes, variaveis e dto (ex: CreateSystemBff, CreateSystemBffDto, etc)
  Adicionar métodos CreateMany e DeleteMany nos serviços de cada módulo para melhor performance
  Separar métodos com mais clareza (ex: criar recursos, criar templates, criar sistema, rollback)
  Estudar maneiras de implementar transações distribuídas com mongoose/mongodb
  Estudar logging estruturado (ex: pino) para melhor monitoramento + observabilidade
  Criar fluxo semelhante para atualização (update) de sistema via BFF
*/

@Controller('bff')
export class BffController {
  private readonly logger = new Logger(BffController.name);

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly templatesService: TemplatesService,
    private readonly systemsService: SystemsService,
  ) {}

  @Post('systems')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: BffCreateSystemDto, @Session() session?: UserSession): Promise<SystemResponseDto> {
    const createdResourceIds: string[] = [];
    const createdTemplateIds: string[] = [];
    let createdSystemId: string | null = null;

    try {
      this.logger.log(`Starting system creation: ${createDto.title}`);

      this.logger.log(`Creating ${createDto.resources?.length || 0} resources`);
      for (const resourceDto of createDto.resources || []) {
        const resource = await this.resourcesService.create(resourceDto);
        createdResourceIds.push(resource.id);
        this.logger.log(`Resource created: ${resource.id} - ${resource.name}`);
      }

      this.logger.log(`Creating ${createDto.templates?.length || 0} templates`);
      for (const templateDto of createDto.templates) {
        const template = await this.templatesService.create(templateDto);
        createdTemplateIds.push(template.id);
        this.logger.log(`Template created: ${template.id} - ${template.title}`);
      }

      this.logger.log('Creating system with resources and templates');
      const system = await this.systemsService.create({
        title: createDto.title,
        description: createDto.description,
        creatorId: session?.user?.id || '',
        templateIds: createdTemplateIds,
        resourceIds: createdResourceIds,
      });
      createdSystemId = system.id;

      this.logger.log(`System created successfully: ${system.id} - ${system.title}`);
      return system;
    } catch (error) {
      this.logger.error(`Error creating system: ${createDto.title}`, error);
      await this.rollback(createdResourceIds, createdTemplateIds, createdSystemId, session?.user?.id);
      throw error;
    }
  }

  private async rollback(
    resourceIds: string[],
    templateIds: string[],
    systemId: string | null,
    userId?: string,
  ): Promise<void> {
    this.logger.warn('Starting rollback process');

    if (systemId) {
      try {
        this.logger.log(`Deleting system: ${systemId}`);
        await this.systemsService.delete(systemId, userId || '');
        this.logger.log(`System deleted: ${systemId}`);
      } catch (error) {
        this.logger.error(`Failed to delete system during rollback: ${systemId}`, error);
      }
    }

    for (const templateId of templateIds) {
      try {
        this.logger.log(`Deleting template: ${templateId}`);
        await this.templatesService.delete(templateId);
        this.logger.log(`Template deleted: ${templateId}`);
      } catch (error) {
        this.logger.error(`Failed to delete template during rollback: ${templateId}`, error);
      }
    }

    for (const resourceId of resourceIds) {
      try {
        this.logger.log(`Deleting resource: ${resourceId}`);
        await this.resourcesService.delete(resourceId);
        this.logger.log(`Resource deleted: ${resourceId}`);
      } catch (error) {
        this.logger.error(`Failed to delete resource during rollback: ${resourceId}`, error);
      }
    }

    this.logger.warn('Rollback process completed');
  }
}
