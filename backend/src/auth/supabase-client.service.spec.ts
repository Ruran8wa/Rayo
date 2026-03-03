import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
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

const configServiceMock = {
  get: (key: string) => {
    if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
    if (key === 'SUPABASE_ANON_KEY') return 'anon-key';
  },
};

describe('SupabaseClientService', () => {
  let service: SupabaseClientService;

  beforeEach(async () => {
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
    it('returns user and session on success', async () => {
      const fakeUser = { id: 'uid-1', email: 'a@b.com' };
      const fakeSession = { access_token: 'tok', refresh_token: 'ref', expires_in: 3600 };
      mockSignUp.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null });

      const result = await service.register('a@b.com', 'pass123');

      expect(result).toEqual({ user: fakeUser, session: fakeSession });
    });

    it('throws HttpException when Supabase returns an error', async () => {
      mockSignUp.mockResolvedValue({ data: null, error: { message: 'User already registered', status: 400 } });

      await expect(service.register('a@b.com', 'pass123')).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('returns user and session on success', async () => {
      const fakeUser = { id: 'uid-1', email: 'a@b.com' };
      const fakeSession = { access_token: 'tok', refresh_token: 'ref', expires_in: 3600 };
      mockSignIn.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null });

      const result = await service.login('a@b.com', 'pass123');

      expect(result).toEqual({ user: fakeUser, session: fakeSession });
    });

    it('throws HttpException with 400 on invalid credentials', async () => {
      mockSignIn.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials', status: 400 } });

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(HttpException);
    });
  });
});
