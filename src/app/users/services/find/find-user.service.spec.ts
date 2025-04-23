import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import UserRequestModel from '../../models/user-request.model';
import FindUserService from './find-user.service';

describe('FindUserService', () => {
  let service: FindUserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FindUserService>(FindUserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find an user by id', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });

    const user = buildUserModel(request);
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

    const response = await service.findById(user.id);

    expect(response.id).toBe(user.id);
    expect(response.email).toBe(request.email);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOneBy).toHaveBeenCalledWith(expect.objectContaining({ id: user.id }));
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
