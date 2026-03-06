import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreferencesDto {
  @ApiProperty({
    description: 'Type of disability',
    example: 'mobility',
    required: false,
  })
  @IsOptional()
  @IsString()
  disability_type?: string;

  @ApiProperty({
    description: 'Detailed preference settings',
    example: { wheelchair: true, large_text: false },
  })
  @IsObject()
  preferences: Record<string, unknown>;
}
