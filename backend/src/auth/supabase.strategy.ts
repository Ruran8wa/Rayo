import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import JwksRsa from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(configService: ConfigService) {
    const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
    const jwksClient = JwksRsa({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request: unknown, rawJwtToken: unknown, done: (err: Error | null, key?: string) => void) => {
        const header = JSON.parse(
          Buffer.from((rawJwtToken as string).split('.')[0], 'base64url').toString(),
        ) as { kid?: string };
        jwksClient.getSigningKey(header.kid, (err, key) => {
          if (err) return done(err);
          done(null, key?.getPublicKey());
        });
      },
      algorithms: ['ES256'],
    });
  }

  validate(payload: { sub: string; email?: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
