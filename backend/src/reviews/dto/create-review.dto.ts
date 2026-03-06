import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiPropertyOptional({ description: 'Building ID (for known buildings in DB)' })
  @IsOptional()
  @IsUUID()
  building_id?: string;

  @ApiPropertyOptional({ description: 'Place name (for unverified places not in DB)' })
  @IsOptional()
  @IsString()
  place_name?: string;

  @ApiPropertyOptional({ description: 'Place address (for unverified places)' })
  @IsOptional()
  @IsString()
  place_address?: string;

  @ApiProperty({ enum: ['building', 'floor', 'service'] })
  @IsEnum(['building', 'floor', 'service'])
  scope: 'building' | 'floor' | 'service';

  @ApiProperty({ enum: ['fully', 'partial', 'none'] })
  @IsEnum(['fully', 'partial', 'none'])
  accessibility_level: 'fully' | 'partial' | 'none';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
