import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreferencesDto {
  @ApiProperty({
    description: 'Type of disability',
    example: 'mobility',
  })
  @IsString()
  @IsNotEmpty()
  disability_type: string;

  @ApiProperty({
    description: 'Detailed preference settings',
    example: { wheelchair: true, visual_aid: false },
  })
  @IsObject()
  preferences: Record<string, unknown>;
}
