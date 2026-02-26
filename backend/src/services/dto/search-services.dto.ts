import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchServicesDto {
  @ApiProperty({
    description: 'Service name to search',
    example: 'pharmacy',
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({
    description: 'Latitude for proximity sorting',
    example: -1.9403,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude for proximity sorting',
    example: 30.0594,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({
    description: 'Radius in km (default: 5)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number;
}
