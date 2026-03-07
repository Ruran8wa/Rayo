import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PreferencesDto } from './dto/preferences.dto';
import { SavedPlaceDto } from './dto/saved-place.dto';

type AuthUser = { userId: string };

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered users' })
  listUsers() {
    return this.usersService.listUsers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user activity stats (reviews, saves, badges)' })
  getStats(@CurrentUser() user: AuthUser) {
    return this.usersService.getStats(user.userId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get all badges with earned status and progress' })
  getBadges(@CurrentUser() user: AuthUser) {
    return this.usersService.getBadges(user.userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user disability preferences' })
  getPreferences(@CurrentUser() user: AuthUser) {
    return this.usersService.getPreferences(user.userId);
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Set/update user disability preferences' })
  upsertPreferences(@CurrentUser() user: AuthUser, @Body() dto: PreferencesDto) {
    return this.usersService.upsertPreferences(user.userId, dto);
  }

  @Get('saved-places')
  @ApiOperation({ summary: 'List saved buildings' })
  getSavedPlaces(@CurrentUser() user: AuthUser) {
    return this.usersService.getSavedPlaces(user.userId);
  }

  @Post('saved-places')
  @ApiOperation({ summary: 'Save a building' })
  savePlace(@CurrentUser() user: AuthUser, @Body() dto: SavedPlaceDto) {
    return this.usersService.savePlace(user.userId, dto.buildingId);
  }

  @Delete('saved-places/:id')
  @ApiOperation({ summary: 'Remove a saved building' })
  removePlace(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.usersService.removePlace(user.userId, id);
  }
}
