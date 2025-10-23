import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ResourcesService } from '../../app/resources/application/resources.service';
import { TemplatesService } from '../../app/templates/application/templates.service';
import { SystemsService } from '../../app/systems/application/systems.service';
import { BffCreateSystemDto } from './dto/create-system.dto';
import { SystemResponseDto } from '../../app/systems/application/dto/system-response.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import { UserSession } from '../../lib/auth';
import { CreationContext } from './interfaces/creation-context.interface';

/*
TO-DOS: 
  Adicionar métodos CreateMany e DeleteMany nos serviços de cada módulo para melhor performance
  Estudar maneiras de implementar transações distribuídas com mongoose/mongodb
  Estudar logging estruturado (ex: pino) para melhor monitoramento + observabilidade
  Estudar telemetria distribuída (ex: OpenTelemetry) para rastreamento de requests, performance e erros
  Criar fluxo semelhante para atualização (update) de sistema via BFF
  Estudar melhor sobre dados idempotentes para evitar duplicações em falhas de rede
  Criar um mecanismo de retry para operações críticas
*/

@Controller('bff/systems')
export class CreateSystemBffController {
  private readonly logger = new Logger(CreateSystemBffController.name);

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly templatesService: TemplatesService,
    private readonly systemsService: SystemsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async execute(@Body() createDto: BffCreateSystemDto, @Session() session?: UserSession): Promise<SystemResponseDto> {
    const context: CreationContext = {
      resourceIds: [],
      templateIds: [],
      systemId: null,
      userId: session?.user?.id,
    };

    try {
      return await this.create(createDto, context, session);
    } catch (error) {
      this.logger.error(`Error creating system: ${createDto.title}`, error);
      await this.rollback(context);
      throw error;
    }
  }

  private async create(createDto: BffCreateSystemDto, context: CreationContext, session: UserSession | undefined) {
    this.logger.log(`Starting system creation: ${createDto.title}`);

    const [resourceIds, templateIds] = await Promise.all([
      this.createResources(createDto),
      this.createTemplates(createDto),
    ]);

    context.resourceIds = resourceIds;
    context.templateIds = templateIds;

    const createdSystem = await this.createSystem(createDto, session, context.templateIds, context.resourceIds);

    context.systemId = createdSystem.id;

    this.logger.log(`System created successfully: ${createdSystem.id} - ${createdSystem.title}`);

    return createdSystem;
  }

  private async createResources(createDto: BffCreateSystemDto) {
    const createdResourceIds: string[] = [];

    this.logger.log(`Creating ${createDto.resources?.length || 0} resources`);

    for (const resourceDto of createDto.resources || []) {
      const resource = await this.resourcesService.create(resourceDto);

      createdResourceIds.push(resource.id);

      this.logger.log(`Resource created: ${resource.id} - ${resource.name}`);
    }

    return createdResourceIds;
  }

  private async createTemplates(createDto: BffCreateSystemDto) {
    const createdTemplateIds: string[] = [];

    this.logger.log(`Creating ${createDto.templates?.length || 0} templates`);

    for (const templateDto of createDto.templates) {
      const template = await this.templatesService.create(templateDto);

      createdTemplateIds.push(template.id);

      this.logger.log(`Template created: ${template.id} - ${template.title}`);
    }

    return createdTemplateIds;
  }

  private async createSystem(
    createDto: BffCreateSystemDto,
    session: UserSession | undefined,
    createdTemplateIds: string[],
    createdResourceIds: string[],
  ) {
    this.logger.log('Creating system with resources and templates');

    const system = await this.systemsService.create({
      title: createDto.title,
      description: createDto.description,
      creatorId: session?.user?.id || '',
      templateIds: createdTemplateIds,
      resourceIds: createdResourceIds,
    });

    return system;
  }

  private async rollback(context: CreationContext): Promise<void> {
    this.logger.warn('Starting rollback process');

    await this.rollbackSystem(context);

    await this.rollbackTemplates(context);

    await this.rollbackResources(context);

    this.logger.warn('Rollback process completed');
  }

  private async rollbackSystem(context: CreationContext) {
    if (context.systemId) {
      try {
        this.logger.log(`Deleting system: ${context.systemId}`);

        await this.systemsService.delete(context.systemId, context.userId || '');

        this.logger.log(`System deleted: ${context.systemId}`);
      } catch (error) {
        this.logger.error(`Failed to delete system during rollback: ${context.systemId}`, error);
      }
    }
  }

  private async rollbackTemplates(context: CreationContext) {
    for (const templateId of context.templateIds) {
      try {
        this.logger.log(`Deleting template: ${templateId}`);

        await this.templatesService.delete(templateId);

        this.logger.log(`Template deleted: ${templateId}`);
      } catch (error) {
        this.logger.error(`Failed to delete template during rollback: ${templateId}`, error);
      }
    }
  }

  private async rollbackResources(context: CreationContext) {
    for (const resourceId of context.resourceIds) {
      try {
        this.logger.log(`Deleting resource: ${resourceId}`);

        await this.resourcesService.delete(resourceId);

        this.logger.log(`Resource deleted: ${resourceId}`);
      } catch (error) {
        this.logger.error(`Failed to delete resource during rollback: ${resourceId}`, error);
      }
    }
  }
}
