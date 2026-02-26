import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { SearchServicesDto } from './dto/search-services.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search services by name with optional proximity sorting',
  })
  search(@Query() dto: SearchServicesDto) {
    return this.servicesService.searchNearby(
      dto.q,
      dto.lat,
      dto.lng,
      dto.radius,
    );
  }
}
