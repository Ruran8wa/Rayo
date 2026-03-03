import { ConfigService } from '@nestjs/config';

jest.mock('jwks-rsa', () => {
  return jest.fn(() => ({
    getSigningKey: jest.fn(),
  }));
});

import { SupabaseStrategy } from './supabase.strategy';

const configServiceMock: Partial<ConfigService> = {
  getOrThrow: (key: string) => {
    if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
    throw new Error(`Unknown config key: ${key}`);
  },
};

describe('SupabaseStrategy', () => {
  it('constructs without throwing', () => {
    expect(
      () => new SupabaseStrategy(configServiceMock as ConfigService),
    ).not.toThrow();
  });

  describe('validate', () => {
    it('returns userId and email from payload', () => {
      const strategy = new SupabaseStrategy(configServiceMock as ConfigService);
      const result = strategy.validate({ sub: 'user-123', email: 'a@b.com' });
      expect(result).toEqual({ userId: 'user-123', email: 'a@b.com' });
    });

    it('returns undefined email when not in payload', () => {
      const strategy = new SupabaseStrategy(configServiceMock as ConfigService);
      const result = strategy.validate({ sub: 'user-123' });
      expect(result).toEqual({ userId: 'user-123', email: undefined });
    });
  });
});
