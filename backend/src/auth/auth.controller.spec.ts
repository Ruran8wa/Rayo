import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SupabaseClientService } from './supabase-client.service';

const mockService = {
  register: jest.fn(),
  login: jest.fn(),
};

const fakeResult = {
  user: { id: '1', email: 'a@b.com', name: 'Jane', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  tokens: { access_token: 'tok', refresh_token: 'ref' },
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: SupabaseClientService, useValue: mockService }],
    }).compile();
    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('register forwards all dto fields to service', async () => {
    mockService.register.mockResolvedValue(fakeResult);

    const result = await controller.register({
      email: 'a@b.com',
      password: 'pass123',
      name: 'Jane',
      disability_type: 'Mobility impairment',
    });

    expect(mockService.register).toHaveBeenCalledWith(
      'a@b.com',
      'pass123',
      'Jane',
      'Mobility impairment',
    );
    expect(result).toEqual(fakeResult);
  });

  it('register works when name and disability_type are omitted', async () => {
    mockService.register.mockResolvedValue(fakeResult);

    await controller.register({ email: 'a@b.com', password: 'pass123' });

    expect(mockService.register).toHaveBeenCalledWith('a@b.com', 'pass123', undefined, undefined);
  });

  it('login delegates to service', async () => {
    mockService.login.mockResolvedValue(fakeResult);

    const result = await controller.login({ email: 'a@b.com', password: 'pass123' });

    expect(mockService.login).toHaveBeenCalledWith('a@b.com', 'pass123');
    expect(result).toEqual(fakeResult);
  });
});
