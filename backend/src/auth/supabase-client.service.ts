import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  email: string;
  name: string;
  disability_type?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

interface AuthResult {
  user: AppUser;
  tokens: AuthTokens;
}

@Injectable()
export class SupabaseClientService {
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    this.client = createClient(url, key);
  }

  private mapResult(user: any, session: any): AuthResult {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? user.email,
        disability_type: user.user_metadata?.disability_type,
        createdAt: user.created_at,
        updatedAt: user.updated_at ?? user.created_at,
      },
      tokens: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    };
  }

  async register(
    email: string,
    password: string,
    name?: string,
    disability_type?: string,
  ): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, disability_type } },
    });
    if (error) throw new BadRequestException(error.message);
    return this.mapResult(data.user, data.session);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new UnauthorizedException(error.message);
    return this.mapResult(data.user, data.session);
  }
}
