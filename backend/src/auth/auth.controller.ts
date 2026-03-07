import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupabaseClientService } from './supabase-client.service';
import { AuthDto } from './dto/auth.dto';

class RefreshDto {
  @ApiProperty()
  @IsString()
  refresh_token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseClient: SupabaseClientService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: AuthDto) {
    return this.supabaseClient.register(dto.email, dto.password, dto.name, dto.disability_type);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: AuthDto) {
    return this.supabaseClient.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.supabaseClient.refresh(dto.refresh_token);
  }
}
