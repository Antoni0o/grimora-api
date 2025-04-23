import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from './create-user.service';
import UserRequestModel from '../../models/user-request.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });

    const user = buildUserModel(request);
    jest.spyOn(repository, 'save').mockResolvedValue(user);

    const response = await service.create(request);

    expect(response.id).toBeDefined();
    expect(response.email).toBe(request.email);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: request.email, name: request.name, password: request.password }),
    );
  });

  it('should throw error if user already exists', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });

    jest
      .spyOn(repository, 'save')
      .mockRejectedValue(
        new QueryFailedError('create', [], new Error('duplicate key value violates unique constraint')),
      );

    await expect(service.create(request)).rejects.toThrow(QueryFailedError);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: request.email,
        name: request.name,
        password: request.password,
      }),
    );
  });
});

function buildUserModel(request: UserRequestModel) {
  return new User({
    id: '1',
    email: request.email,
    name: request.name,
    password: request.password,
  });
}
