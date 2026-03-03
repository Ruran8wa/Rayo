import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

@Injectable()
export class SupabaseClientService {
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const key = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    this.client = createClient(url, key);
  }

  async register(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw new BadRequestException(error.message);
    return { user: data.user, session: data.session };
  }

  async login(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user, session: data.session };
  }
}
