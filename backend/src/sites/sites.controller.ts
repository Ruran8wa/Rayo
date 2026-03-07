import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/upsert-site.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'List all sites with building count' })
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a site with its buildings' })
  findOne(@Param('id') id: string) {
    return this.sitesService.findById(id);
  }

  @Get(':id/buildings')
  @ApiOperation({ summary: 'List all buildings in a site' })
  findBuildings(@Param('id') id: string) {
    return this.sitesService.findBuildings(id);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a site' })
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a site — re-predicts all buildings if site_type changes' })
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.sitesService.update(id, dto);
  }
}
