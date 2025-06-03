import { Test, TestingModule } from '@nestjs/testing';
import { SystemsService } from './systems.service';
import { SYSTEM_REPOSITORY } from '../domain/constants/system.constants';
import { ISystemRepository } from '../domain/repositories/system.repository.interface';
import { CreateSystemDto } from './dto/create-system.dto';
import { System } from '../domain/entities/system.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('SystemsService', () => {
  let service: SystemsService;
  let repository: ISystemRepository;

  const resourceIds = [];
  const templateId = 'templateUUID';
  const creatorId = 'creatorUUID';
  const title = 'new rpg system';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemsService,
        {
          provide: SYSTEM_REPOSITORY,
          useValue: <ISystemRepository>{
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SystemsService>(SystemsService);
    repository = module.get<ISystemRepository>(SYSTEM_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a system', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateId, resourceIds, creatorId);
    const createdSystem = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'create').mockResolvedValue(createdSystem);

    // act
    const response = await service.create(request);

    // assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title, templateId, resourceIds, creatorId }),
    );
    expect(response).toStrictEqual(expect.objectContaining({ id: createdSystem.id }));
  });

  it('should not create a system if repository fails', async () => {
    // arrange
    const request = new CreateSystemDto(title, templateId, resourceIds, creatorId);

    jest.spyOn(repository, 'create').mockResolvedValue(null);

    // act
    await expect(service.create(request)).rejects.toThrow(InternalServerErrorException);

    // assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title, templateId, resourceIds, creatorId }),
    );
  });

  it('should find all systems', async () => {
    // arrange
    const system = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'findAll').mockResolvedValue([system]);

    // act
    const response = await service.findAll();

    // assert
    expect(response.length).toBe(1);
    expect(response.at(0)?.id).toBe(system.id);
  });

  it('should not find all systems if repository fails', async () => {
    // arrange
    jest.spyOn(repository, 'findAll').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

    // assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should find system by id', async () => {
    // arrange
    const system = new System('systemId', title, creatorId, templateId, resourceIds);

    jest.spyOn(repository, 'findById').mockResolvedValue(system);

    // act
    const response = await service.findOne(system.id);

    // assert
    expect(response.id).toBe(system.id);
  });

  it('should not find system by id if repository returns null', async () => {
    // arrange
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    // act
    await expect(service.findAll()).rejects.toThrow(NotFoundException);

    // assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findById).toHaveBeenCalled();
  });
});
