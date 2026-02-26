import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GeoJsonQueryDto {
  @ApiPropertyOptional({
    description: 'Bounding box: south,west,north,east',
    example: '-2.0,29.8,-1.8,30.2',
  })
  @IsString()
  @IsOptional()
  bbox?: string;
}
