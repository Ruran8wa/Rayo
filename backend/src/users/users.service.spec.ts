import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockAdminListUsers = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: {
        listUsers: mockAdminListUsers,
      },
    },
  }),
}));

const configServiceMock: Partial<ConfigService> = {
  getOrThrow: (key: string) => {
    if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
    if (key === 'SUPABASE_API_SECRET') return 'service-role-key';
    throw new Error(`Unknown config key: ${key}`);
  },
};

const prismaMock = {
  userPreference: { findUnique: jest.fn(), upsert: jest.fn() },
  savedPlace: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
  building: { findUnique: jest.fn() },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    mockAdminListUsers.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('listUsers', () => {
    it('returns shaped user list on success', async () => {
      const fakeUsers = [
        { id: 'uid-1', email: 'a@b.com', created_at: '2026-01-01', last_sign_in_at: '2026-02-01' },
        { id: 'uid-2', email: 'c@d.com', created_at: '2026-01-02', last_sign_in_at: null },
      ];
      mockAdminListUsers.mockResolvedValue({ data: { users: fakeUsers }, error: null });

      const result = await service.listUsers();

      expect(result).toEqual({
        users: [
          { id: 'uid-1', email: 'a@b.com', created_at: '2026-01-01', last_sign_in_at: '2026-02-01' },
          { id: 'uid-2', email: 'c@d.com', created_at: '2026-01-02', last_sign_in_at: null },
        ],
      });
    });

    it('throws InternalServerErrorException when Supabase returns an error', async () => {
      mockAdminListUsers.mockResolvedValue({ data: null, error: { message: 'Admin error' } });

      await expect(service.listUsers()).rejects.toThrow();
    });
  });
});
