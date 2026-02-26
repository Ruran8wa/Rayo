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

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Get user disability preferences' })
  getPreferences(@CurrentUser() user: { userId: string }) {
    return this.usersService.getPreferences(user.userId);
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Set/update user disability preferences' })
  upsertPreferences(
    @CurrentUser() user: { userId: string },
    @Body() dto: PreferencesDto,
  ) {
    return this.usersService.upsertPreferences(user.userId, dto);
  }

  @Get('saved-places')
  @ApiOperation({ summary: 'List saved buildings' })
  getSavedPlaces(@CurrentUser() user: { userId: string }) {
    return this.usersService.getSavedPlaces(user.userId);
  }

  @Post('saved-places')
  @ApiOperation({ summary: 'Save a building' })
  savePlace(
    @CurrentUser() user: { userId: string },
    @Body() dto: SavedPlaceDto,
  ) {
    return this.usersService.savePlace(user.userId, dto.buildingId);
  }

  @Delete('saved-places/:id')
  @ApiOperation({ summary: 'Remove a saved building' })
  removePlace(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.usersService.removePlace(user.userId, id);
  }
}
