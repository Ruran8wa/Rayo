import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty({ example: 'Kenyatta National Hospital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hospital' })
  @IsString()
  @IsNotEmpty()
  site_type: string;

  @ApiProperty({ example: 'Ngong Rd, Nairobi' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: -1.2921 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 36.8219 })
  @IsNumber()
  lng: number;
}

export class UpdateSiteDto {
  @ApiProperty({ example: 'Kenyatta National Hospital', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'hospital', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  site_type?: string;

  @ApiProperty({ example: 'Ngong Rd, Nairobi', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: -1.2921, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 36.8219, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
