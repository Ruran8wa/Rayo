import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { SearchBuildingsDto } from './dto/search-buildings.dto';
import { GeoJsonQueryDto } from './dto/geojson-query.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get building detail with floors and services' })
  findOne(@Param('id') id: string) {
    return this.buildingsService.findById(id);
  }
}
