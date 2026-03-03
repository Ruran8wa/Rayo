import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseClientService } from './supabase-client.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supabase-jwt' }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [SupabaseStrategy, SupabaseGuard, SupabaseClientService],
  exports: [SupabaseGuard],
})
export class AuthModule {}
