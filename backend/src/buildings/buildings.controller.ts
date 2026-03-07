import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { SearchBuildingsDto } from './dto/search-buildings.dto';
import { GeoJsonQueryDto } from './dto/geojson-query.dto';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/upsert-building.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('Buildings')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search buildings by name (partial match)' })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  search(@Query() dto: SearchBuildingsDto) {
    return this.buildingsService.search(dto.q);
  }

  @Get('geojson')
  @ApiOperation({ summary: 'Get buildings as GeoJSON for map viewport' })
  getGeoJson(@Query() dto: GeoJsonQueryDto) {
    return this.buildingsService.getGeoJson(dto.bbox);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find buildings within ~2 km of a coordinate' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.buildingsService.findNearby(parseFloat(lat), parseFloat(lng));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building detail with floors and services' })
  findOne(@Param('id') id: string) {
    return this.buildingsService.findById(id);
  }

  @Post('geocode-all')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update every building\'s lat/lng using Google Places (admin)' })
  geocodeAll() {
    return this.buildingsService.geocodeAll();
  }

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a building and auto-trigger ML prediction' })
  create(@Body() dto: CreateBuildingDto) {
    return this.buildingsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a building and auto-trigger ML prediction' })
  update(@Param('id') id: string, @Body() dto: UpdateBuildingDto) {
    return this.buildingsService.update(id, dto);
  }
}
