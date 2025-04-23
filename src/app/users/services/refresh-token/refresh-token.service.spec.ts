import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import UserRequestModel from '../../models/user-request.model';
import RefreshTokenService from './refresh-token.service';
import { NotFoundException } from '@nestjs/common';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save an user refresh token', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });
    const refreshToken = 'refresh-token';

    const user = buildUserModel(request);
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(repository, 'save').mockResolvedValue(user);

    const response = await service.set(user.id, refreshToken);

    expect(response.id).toBe(user.id);
    expect(response.refreshToken).toBe(refreshToken);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOneBy).toHaveBeenCalledWith(expect.objectContaining({ id: user.id }));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ refreshToken: refreshToken }));
  });

  it('should throw error when user by id isnt found', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });
    const refreshToken = 'refresh-token';
    const user = buildUserModel(request);

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

    await expect(service.set(user.id, refreshToken)).rejects.toThrow(NotFoundException);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOneBy).toHaveBeenCalledWith(expect.objectContaining({ id: user.id }));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should get an user refresh token', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });
    const refreshToken = 'refresh-token';

    const user = buildUserModel(request);
    user.refreshToken = refreshToken;
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

    const response = await service.get(user.id);

    expect(response).toBe(refreshToken);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOneBy).toHaveBeenCalledWith(expect.objectContaining({ id: user.id }));
  });

  it('should return undefined when dont find user', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });

    const user = buildUserModel(request);
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

    const response = await service.get(user.id);

    expect(response).toBe(undefined);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findOneBy).toHaveBeenCalledWith(expect.objectContaining({ id: user.id }));
  });

  it('should return undefined when dont find refreshToken', async () => {
    const request = new UserRequestModel({ email: 'test@mail.com', name: 'Test User', password: 'password123' });

    const user = buildUserModel(request);
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

    const response = await service.get(user.id);

    expect(response).toBe(undefined);

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
