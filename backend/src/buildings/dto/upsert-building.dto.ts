import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: 'uuid-of-site' })
  @IsString()
  @IsNotEmpty()
  site_id: string;

  @ApiProperty({ example: 'Main Block' })
  @IsString()
  @IsNotEmpty()
  building_name: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  total_floors: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  step_free_entrance: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  elevator_present: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  handrails_present: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  ramps_present: boolean;

  @ApiProperty({ example: -1.2921, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 36.8219, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class UpdateBuildingDto {
  @ApiProperty({ example: 'Main Block', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  building_name?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  total_floors?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  step_free_entrance?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  elevator_present?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  handrails_present?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  ramps_present?: boolean;

  @ApiProperty({ example: -1.2921, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 36.8219, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
