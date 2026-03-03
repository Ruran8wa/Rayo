import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseClientService } from './supabase-client.service';

const mockSignUp = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
    },
  }),
}));

const configServiceMock: Partial<ConfigService> = {
  getOrThrow: (key: string) => {
    if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
    if (key === 'SUPABASE_ANON_KEY') return 'anon-key';
    throw new Error(`Unknown config key: ${key}`);
  },
};

const fakeUser = {
  id: 'uid-1',
  email: 'a@b.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  user_metadata: { full_name: 'Jane Smith', disability_type: 'Mobility impairment' },
};
const fakeSession = { access_token: 'tok', refresh_token: 'ref', expires_in: 3600 };

describe('SupabaseClientService', () => {
  let service: SupabaseClientService;

  beforeEach(async () => {
    mockSignUp.mockReset();
    mockSignIn.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        SupabaseClientService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();
    service = module.get(SupabaseClientService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('calls signUp with user_metadata when name and disability_type provided', async () => {
      mockSignUp.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null });

      await service.register('a@b.com', 'pass123', 'Jane Smith', 'Mobility impairment');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass123',
        options: { data: { full_name: 'Jane Smith', disability_type: 'Mobility impairment' } },
      });
    });

    it('returns mapped AppUser and tokens on success', async () => {
      mockSignUp.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null });

      const result = await service.register('a@b.com', 'pass123', 'Jane Smith', 'Mobility impairment');

      expect(result).toEqual({
        user: {
          id: 'uid-1',
          email: 'a@b.com',
          name: 'Jane Smith',
          disability_type: 'Mobility impairment',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        tokens: {
          access_token: 'tok',
          refresh_token: 'ref',
        },
      });
    });

    it('falls back to email as name when user_metadata has no full_name', async () => {
      const userNoName = { ...fakeUser, user_metadata: {} };
      mockSignUp.mockResolvedValue({ data: { user: userNoName, session: fakeSession }, error: null });

      const result = await service.register('a@b.com', 'pass123');

      expect(result.user.name).toBe('a@b.com');
    });

    it('throws BadRequestException when Supabase returns an error', async () => {
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'User already registered' } });

      await expect(service.register('a@b.com', 'pass123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('returns mapped AppUser and tokens on success', async () => {
      mockSignIn.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null });

      const result = await service.login('a@b.com', 'pass123');

      expect(result).toEqual({
        user: {
          id: 'uid-1',
          email: 'a@b.com',
          name: 'Jane Smith',
          disability_type: 'Mobility impairment',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        tokens: {
          access_token: 'tok',
          refresh_token: 'ref',
        },
      });
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      mockSignIn.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } });

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
