import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SupabaseClientService } from './supabase-client.service';

const mockService = {
  register: jest.fn(),
  login: jest.fn(),
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

  it('register delegates to service', async () => {
    const expected = { user: { id: '1', email: 'a@b.com' }, session: { access_token: 'tok' } };
    mockService.register.mockResolvedValue(expected);

    const result = await controller.register({ email: 'a@b.com', password: 'pass123' });

    expect(mockService.register).toHaveBeenCalledWith('a@b.com', 'pass123');
    expect(result).toEqual(expected);
  });

  it('login delegates to service', async () => {
    const expected = { user: { id: '1', email: 'a@b.com' }, session: { access_token: 'tok' } };
    mockService.login.mockResolvedValue(expected);

    const result = await controller.login({ email: 'a@b.com', password: 'pass123' });

    expect(mockService.login).toHaveBeenCalledWith('a@b.com', 'pass123');
    expect(result).toEqual(expected);
  });
});
