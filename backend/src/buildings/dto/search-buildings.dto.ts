import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchBuildingsDto {
  @ApiProperty({
    description: 'Search query for building name',
    example: 'Leadership',
  })
  @IsString()
  @IsNotEmpty()
  q: string;
}
