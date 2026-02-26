import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceDetailDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() is_critical: boolean;
  @ApiProperty() is_accessible: boolean;
}

export class FloorDetailDto {
  @ApiProperty() id: string;
  @ApiProperty() floor_level: number;
  @ApiProperty() mobility_accessible: boolean;
  @ApiProperty() clear_signage: boolean;
  @ApiProperty() high_contrast_signage: boolean;
  @ApiProperty({ type: [ServiceDetailDto] }) services: ServiceDetailDto[];
}

export class SiteInfoDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() site_type: string;
  @ApiProperty() address: string;
}

export class BuildingDetailDto {
  @ApiProperty() id: string;
  @ApiProperty() building_name: string;
  @ApiProperty() total_floors: number;
  @ApiProperty() step_free_entrance: boolean;
  @ApiProperty() elevator_present: boolean;
  @ApiProperty() handrails_present: boolean;
  @ApiProperty() ramps_present: boolean;
  @ApiPropertyOptional() accessibility_class: string | null;
  @ApiPropertyOptional() accessibility_score: number | null;
  @ApiPropertyOptional() lat: number | null;
  @ApiPropertyOptional() lng: number | null;
  @ApiProperty({ type: SiteInfoDto }) site: SiteInfoDto;
  @ApiProperty({ type: [FloorDetailDto] }) floors: FloorDetailDto[];
}
