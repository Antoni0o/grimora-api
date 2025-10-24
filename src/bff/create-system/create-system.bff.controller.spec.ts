import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

import { ResourcesService } from '../../app/resources/application/resources.service';
import { TemplatesService } from '../../app/templates/application/templates.service';
import { SystemsService } from '../../app/systems/application/systems.service';

import { ResourceMongoSchema, ResourceSchema } from '../../app/resources/infraestructure/resources.schema';
import { TemplateMongoSchema, TemplateSchema } from '../../app/templates/infraestructure/template.schema';
import { SystemMongoSchema, SystemSchema } from '../../app/systems/infraestructure/system.schema';

import { ResourcesRepository } from '../../app/resources/infraestructure/resources.mongoose.repository';
import { TemplatesRepository } from '../../app/templates/infraestructure/template.mongoose.repository';
import { SystemRepository } from '../../app/systems/infraestructure/system.mongoose.repository';

import { RESOURCES_REPOSITORY } from '../../app/resources/domain/constants/resources.constants';
import { TEMPLATES_REPOSITORY } from '../../app/templates/domain/constants/template.constants';
import { SYSTEM_REPOSITORY } from '../../app/systems/domain/constants/system.constants';

import { BffCreateSystemDto } from './dto/create-system.dto';
import { CreateResourceDto } from '../../app/resources/application/dto/create-resource.dto';
import { CreateTemplateDto } from '../../app/templates/application/dto/create-template.dto';
import { ResourceItemRequestDto } from '../../app/resources/application/dto/resource-item-request.dto';
import { FieldRequestDto } from '../../app/templates/application/dto/field-request.dto';
import { PositionDto } from '../../app/templates/application/dto/position.dto';
import { FieldType } from '../../app/templates/domain/enums/field-type.enum';
import { LikesService } from '../../app/likes/application/likes.service';
import { CreateSystemBffController } from './create-system.bff.controller';
import { UserSession } from '../../lib/auth';
import { v4 as uuid } from 'uuid';

describe('CreateSystemBffController', () => {
  let controller: CreateSystemBffController;
  let resourcesService: ResourcesService;
  let templatesService: TemplatesService;
  let systemsService: SystemsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let resourceModel: Model<ResourceMongoSchema>;
  let templateModel: Model<TemplateMongoSchema>;
  let systemModel: Model<SystemMongoSchema>;

  const userId = uuid();
  const userSession = <UserSession>{
    user: {
      id: userId,
    },
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    resourceModel = mongoConnection.model(ResourceMongoSchema.name, ResourceSchema);
    templateModel = mongoConnection.model(TemplateMongoSchema.name, TemplateSchema);
    systemModel = mongoConnection.model(SystemMongoSchema.name, SystemSchema);

    const mockLikesService = {
      deleteAllLikesForEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateSystemBffController],
      providers: [
        ResourcesService,
        TemplatesService,
        SystemsService,
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
        {
          provide: RESOURCES_REPOSITORY,
          useClass: ResourcesRepository,
        },
        {
          provide: TEMPLATES_REPOSITORY,
          useClass: TemplatesRepository,
        },
        {
          provide: SYSTEM_REPOSITORY,
          useClass: SystemRepository,
        },
        {
          provide: getModelToken(ResourceMongoSchema.name),
          useValue: resourceModel,
        },
        {
          provide: getModelToken(TemplateMongoSchema.name),
          useValue: templateModel,
        },
        {
          provide: getModelToken(SystemMongoSchema.name),
          useValue: systemModel,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<CreateSystemBffController>(CreateSystemBffController);
    resourcesService = module.get<ResourcesService>(ResourcesService);
    templatesService = module.get<TemplatesService>(TemplatesService);
    systemsService = module.get<SystemsService>(SystemsService);
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(resourcesService).toBeDefined();
    expect(templatesService).toBeDefined();
    expect(systemsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a complete D&D system with weapons, spells and character sheets', async () => {
      const dndSystem = buildDnDSystem();

      const createdSystem = await controller.execute(dndSystem, userSession);

      expect(createdSystem).toBeDefined();
      expect(createdSystem.title).toBe('Dungeons & Dragons 5e');
      expect(createdSystem.resourceIds).toHaveLength(3);
      expect(createdSystem.templateIds).toHaveLength(2);

      const resources = await findResourcesByIds(createdSystem.resourceIds);
      expect(resources).toHaveLength(3);
      expect(resources.map(r => r.title)).toEqual(expect.arrayContaining(['Weapon', 'Spell', 'Armor']));

      const templates = await findTemplatesByIds(createdSystem.templateIds);
      expect(templates).toHaveLength(2);
      expect(templates.map(t => t.title)).toEqual(expect.arrayContaining(['Warrior Sheet', 'Mage Sheet']));

      const system = await systemModel.findById(createdSystem.id);
      expect(system).toBeDefined();
      expect(system?.title).toBe('Dungeons & Dragons 5e');
    });

    it('should create Pathfinder system with weapons and warrior sheets', async () => {
      const pathfinderSystem = buildPathfinderSystem();

      const createdSystem = await controller.execute(pathfinderSystem, userSession);

      expect(createdSystem).toBeDefined();
      expect(createdSystem.resourceIds).toHaveLength(2);
      expect(createdSystem.templateIds).toHaveLength(1);

      const resources = await findResourcesByIds(createdSystem.resourceIds);
      expect(resources).toHaveLength(2);
      expect(resources.map(r => r.title)).toEqual(expect.arrayContaining(['Weapon', 'Spell']));

      const templates = await findTemplatesByIds(createdSystem.templateIds);
      expect(templates).toHaveLength(1);
      expect(templates[0].title).toBe('Warrior Sheet');
    });

    it('should create RPG system with only character templates (no resources)', async () => {
      const bffCreateSystemDto: BffCreateSystemDto = new BffCreateSystemDto(
        'Narrative RPG System',
        'Story-focused RPG without resource management',
        [],
        [buildSimpleCharacterTemplate()],
      );

      const createdSystem = await controller.execute(bffCreateSystemDto, userSession);

      expect(createdSystem).toBeDefined();
      expect(createdSystem.resourceIds).toHaveLength(0);
      expect(createdSystem.templateIds).toHaveLength(1);

      const system = await systemModel.findById(createdSystem.id);
      expect(system).toBeDefined();
      expect(system?.resources).toHaveLength(0);
      expect(system?.templates).toHaveLength(1);
    });
  });

  describe('Integration between services', () => {
    it('should create spells and warrior sheets in a fantasy system', async () => {
      const fantasySystem = buildGenericFantasySystem();

      const createdSystem = await controller.execute(fantasySystem, userSession);

      const resources = await findResourcesByIds(createdSystem.resourceIds);
      expect(resources).toHaveLength(1);
      expect(resources[0].title).toBe('Item');

      const templates = await findTemplatesByIds(createdSystem.templateIds);
      expect(templates).toHaveLength(1);
      expect(templates[0].title).toBe('Simple Character');

      const system = await systemModel.findById(createdSystem.id);
      expect(system?.resources).toEqual(
        expect.arrayContaining(createdSystem.resourceIds.map(id => Types.ObjectId.createFromHexString(id))),
      );
      expect(system?.templates).toEqual(
        expect.arrayContaining(createdSystem.templateIds.map(id => Types.ObjectId.createFromHexString(id))),
      );
    });

    it('should ensure all RPG entities are persisted correctly', async () => {
      const bffCreateSystemDto: BffCreateSystemDto = new BffCreateSystemDto(
        'Complete D&D System',
        'Full D&D system with all entity types',
        [buildWeaponResource(), buildArmorResource()],
        [buildWarriorTemplate(), buildMonsterTemplate()],
      );

      const createdSystem = await controller.execute(bffCreateSystemDto, userSession);

      const resources = await findResourcesByIds(createdSystem.resourceIds);
      expect(resources[0].items).toBeDefined();
      expect(resources[0].items!.length).toBeGreaterThan(0);

      const templates = await findTemplatesByIds(createdSystem.templateIds);
      expect(templates[0].fields).toBeDefined();
      expect(templates[0].fields!.length).toBeGreaterThan(0);
      expect(templates[0].usedPositions).toBeDefined();

      await expectSystemIntegrity(createdSystem.id, 2, 2);
    });

    it('should handle complex character sheet positioning correctly', async () => {
      const bffCreateSystemDto: BffCreateSystemDto = new BffCreateSystemDto(
        'Advanced Character System',
        'Complex character sheet with multi-position fields',
        [],
        [
          new CreateTemplateDto('Advanced Character Sheet', [
            new FieldRequestDto('Character Portrait', FieldType.TEXT, [
              new PositionDto(1, 1),
              new PositionDto(1, 2),
              new PositionDto(1, 3),
            ]),
            new FieldRequestDto('Attributes', FieldType.NUMBER, [new PositionDto(2, 1), new PositionDto(2, 2)]),
            new FieldRequestDto('Equipment Slot', FieldType.SELECT, [new PositionDto(3, 1)]),
          ]),
        ],
      );

      const createdSystem = await controller.execute(bffCreateSystemDto, userSession);

      const template = await templateModel.findById(Types.ObjectId.createFromHexString(createdSystem.templateIds[0]));
      expect(template).toBeDefined();
      expect(template?.usedPositions).toBeDefined();
      expect(template?.usedPositions.length).toBe(6);

      expect(template?.fields).toHaveLength(3);
      expect(template!.fields![0].positions).toHaveLength(3);
      expect(template!.fields![1].positions).toHaveLength(2);
      expect(template!.fields![2].positions).toHaveLength(1);
    });
  });

  describe('Error handling and rollback behavior', () => {
    describe('Resource validation', () => {
      it('should reject resource with empty name', async () => {
        const system = buildSystemWithInvalidResource();

        await expectSystemCreationToFail(system);
      });
    });

    describe('Template validation', () => {
      it('should reject template with invalid position (0,0)', async () => {
        const system = buildSystemWithInvalidTemplatePosition(0, 0);

        await expectSystemCreationToFail(system);
      });

      it('should reject template with position exceeding grid limits', async () => {
        const system = buildSystemWithInvalidTemplatePosition(25, 10);

        await expectSystemCreationToFail(system);
      });

      it('should reject template with negative position', async () => {
        const system = buildSystemWithInvalidTemplatePosition(-1, 5);

        await expectSystemCreationToFail(system);
      });

      it('should reject template with empty title', async () => {
        const system = buildSystemWithEmptyTemplateTitle();

        await expectSystemCreationToFail(system);
      });
    });

    describe('Position collision validation', () => {
      it('should reject template when fields overlap on same position', async () => {
        const system = buildSystemWithCollidingPositions();

        await expectSystemCreationToFail(system);
      });
    });

    describe('System validation', () => {
      it('should reject system with empty title and rollback all created entities', async () => {
        const system = buildSystemWithEmptyTitle();

        await expectSystemCreationToFail(system);
        await waitForRollbackToComplete();
        await expectAllEntitiesRolledBack();
      });
    });

    describe('Rollback behavior with mocked failures', () => {
      it('should rollback all entities when system service fails', async () => {
        mockSystemServiceToFail();
        const system = buildValidSystem();

        await expectSystemCreationToFail(system, 'System creation failed');
        await waitForRollbackToComplete();
        await expectAllEntitiesRolledBack();
      });
    });
  });

  const findResourcesByIds = async (resourceIds: string[]) => {
    return await resourceModel.find({
      _id: { $in: resourceIds.map(id => Types.ObjectId.createFromHexString(id)) },
    });
  };

  const findTemplatesByIds = async (templateIds: string[]) => {
    return await templateModel.find({
      _id: { $in: templateIds.map(id => Types.ObjectId.createFromHexString(id)) },
    });
  };

  const buildWeaponResource = (): CreateResourceDto => {
    return new CreateResourceDto('Weapon', [
      new ResourceItemRequestDto('name', 'Weapon name', { type: 'string' }),
      new ResourceItemRequestDto('damage', 'Weapon damage dice', { type: 'string' }),
      new ResourceItemRequestDto('weight', 'Weapon weight', { type: 'number' }),
    ]);
  };

  const buildSpellResource = (): CreateResourceDto => {
    return new CreateResourceDto('Spell', [
      new ResourceItemRequestDto('name', 'Spell name', { type: 'string' }),
      new ResourceItemRequestDto('level', 'Spell level', { type: 'number' }),
      new ResourceItemRequestDto('school', 'Magic school', { type: 'string' }),
    ]);
  };

  const buildArmorResource = (): CreateResourceDto => {
    return new CreateResourceDto('Armor', [
      new ResourceItemRequestDto('name', 'Armor name', { type: 'string' }),
      new ResourceItemRequestDto('armorClass', 'Armor class bonus', { type: 'number' }),
    ]);
  };

  const buildItemResource = (): CreateResourceDto => {
    return new CreateResourceDto('Item', [
      new ResourceItemRequestDto('name', 'Item name', { type: 'string' }),
      new ResourceItemRequestDto('description', 'Item description', { type: 'string' }),
    ]);
  };

  const buildWarriorTemplate = (): CreateTemplateDto => {
    return new CreateTemplateDto('Warrior Sheet', [
      new FieldRequestDto('Character Name', FieldType.TEXT, [new PositionDto(1, 1), new PositionDto(1, 2)]),
      new FieldRequestDto('Strength', FieldType.NUMBER, [new PositionDto(2, 1)]),
      new FieldRequestDto('Constitution', FieldType.NUMBER, [new PositionDto(2, 2)]),
      new FieldRequestDto('Level', FieldType.NUMBER, [new PositionDto(3, 1)]),
    ]);
  };

  const buildMageTemplate = (): CreateTemplateDto => {
    return new CreateTemplateDto('Mage Sheet', [
      new FieldRequestDto('Character Name', FieldType.TEXT, [new PositionDto(1, 1)]),
      new FieldRequestDto('Intelligence', FieldType.NUMBER, [new PositionDto(2, 1)]),
      new FieldRequestDto('Mana Points', FieldType.NUMBER, [new PositionDto(2, 2)]),
      new FieldRequestDto('Spell Slots', FieldType.TEXT, [new PositionDto(3, 1)]),
    ]);
  };

  const buildMonsterTemplate = (): CreateTemplateDto => {
    return new CreateTemplateDto('Monster Card', [
      new FieldRequestDto('Monster Name', FieldType.TEXT, [new PositionDto(1, 1)]),
      new FieldRequestDto('Hit Points', FieldType.NUMBER, [new PositionDto(2, 1)]),
      new FieldRequestDto('Challenge Rating', FieldType.NUMBER, [new PositionDto(2, 2)]),
    ]);
  };

  const buildSimpleCharacterTemplate = (): CreateTemplateDto => {
    return new CreateTemplateDto('Simple Character', [
      new FieldRequestDto('Name', FieldType.TEXT, [new PositionDto(1, 1)]),
      new FieldRequestDto('Level', FieldType.NUMBER, [new PositionDto(2, 1)]),
    ]);
  };

  const buildDnDSystem = (): BffCreateSystemDto => {
    return new BffCreateSystemDto(
      'Dungeons & Dragons 5e',
      'Classic fantasy tabletop RPG system',
      [buildWeaponResource(), buildSpellResource(), buildArmorResource()],
      [buildWarriorTemplate(), buildMageTemplate()],
    );
  };

  const buildPathfinderSystem = (): BffCreateSystemDto => {
    return new BffCreateSystemDto(
      'Pathfinder 2e',
      'Fantasy RPG with tactical combat',
      [buildWeaponResource(), buildSpellResource()],
      [buildWarriorTemplate()],
    );
  };

  const buildGenericFantasySystem = (): BffCreateSystemDto => {
    return new BffCreateSystemDto(
      'Generic Fantasy RPG',
      'A simple fantasy RPG system for beginners',
      [buildItemResource()],
      [buildSimpleCharacterTemplate()],
    );
  };

  const buildValidResource = (name: string = 'Valid Resource'): CreateResourceDto => {
    const items = [new ResourceItemRequestDto('name', 'Resource name', { type: 'string' })];
    return new CreateResourceDto(name, items);
  };

  const buildValidTemplate = (title: string = 'Valid Template'): CreateTemplateDto => {
    const fields = [new FieldRequestDto('Default Field', FieldType.TEXT, [new PositionDto(1, 1)])];
    return new CreateTemplateDto(title, fields);
  };

  const buildValidSystem = (): BffCreateSystemDto => {
    return new BffCreateSystemDto(
      'Valid System',
      'A valid test system',
      [buildValidResource()],
      [buildValidTemplate()],
    );
  };

  const buildSystemWithInvalidResource = (): BffCreateSystemDto => {
    const invalidResource = new CreateResourceDto('', [
      new ResourceItemRequestDto('name', 'Resource name', { type: 'string' }),
    ]);
    return new BffCreateSystemDto('Invalid Resource System', 'Testing resource validation', [invalidResource], []);
  };

  const buildSystemWithInvalidTemplatePosition = (row: number, column: number): BffCreateSystemDto => {
    const invalidTemplate = new CreateTemplateDto('Invalid Template', [
      new FieldRequestDto('Field', FieldType.TEXT, [new PositionDto(row, column)]),
    ]);
    return new BffCreateSystemDto('Invalid Position System', 'Testing position validation', [], [invalidTemplate]);
  };

  const buildSystemWithEmptyTemplateTitle = (): BffCreateSystemDto => {
    const invalidTemplate = new CreateTemplateDto('', [
      new FieldRequestDto('Field', FieldType.TEXT, [new PositionDto(1, 1)]),
    ]);
    return new BffCreateSystemDto(
      'Empty Template Title System',
      'Testing template title validation',
      [],
      [invalidTemplate],
    );
  };

  const buildSystemWithCollidingPositions = (): BffCreateSystemDto => {
    const templateWithCollision = new CreateTemplateDto('Collision Template', [
      new FieldRequestDto('Field 1', FieldType.TEXT, [new PositionDto(1, 1)]),
      new FieldRequestDto('Field 2', FieldType.NUMBER, [new PositionDto(1, 1)]), // Same position
    ]);
    return new BffCreateSystemDto(
      'Position Collision System',
      'Testing position collision',
      [],
      [templateWithCollision],
    );
  };

  const buildSystemWithEmptyTitle = (): BffCreateSystemDto => {
    return new BffCreateSystemDto('', 'Testing system validation', [buildValidResource()], [buildValidTemplate()]);
  };

  const expectSystemCreationToFail = async (dto: BffCreateSystemDto, expectedError?: string): Promise<void> => {
    const creationPromise = controller.execute(dto, userSession);

    if (expectedError) {
      await expect(creationPromise).rejects.toThrow(expectedError);
    } else {
      await expect(creationPromise).rejects.toThrow();
    }
  };

  const waitForRollbackToComplete = async (delayMs: number = 200): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  };

  const expectAllEntitiesRolledBack = async (): Promise<void> => {
    const resourceCount = await resourceModel.countDocuments();
    const templateCount = await templateModel.countDocuments();
    const systemCount = await systemModel.countDocuments();

    expect(resourceCount).toBe(0);
    expect(templateCount).toBe(0);
    expect(systemCount).toBe(0);
  };

  const mockSystemServiceToFail = (errorMessage: string = 'System creation failed'): void => {
    jest.spyOn(systemsService, 'create').mockRejectedValueOnce(new Error(errorMessage));
  };

  const expectSystemIntegrity = async (
    systemId: string,
    expectedResourceCount: number,
    expectedTemplateCount: number,
  ): Promise<void> => {
    const system = await systemModel.findById(systemId);
    expect(system).toBeDefined();

    const resources = system!.resources as Types.ObjectId[];
    const templates = system!.templates as Types.ObjectId[];

    const resourceCount = await resourceModel.countDocuments({
      _id: { $in: resources.map(id => Types.ObjectId.createFromHexString(id.toString())) },
    });
    const templateCount = await templateModel.countDocuments({
      _id: { $in: templates.map(id => Types.ObjectId.createFromHexString(id.toString())) },
    });

    expect(resourceCount).toBe(expectedResourceCount);
    expect(templateCount).toBe(expectedTemplateCount);
  };
});
