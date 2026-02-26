import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PredictService } from './predict.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('Predict')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('predict')
export class PredictController {
  constructor(private readonly predictService: PredictService) {}

  @Post(':buildingId')
  @ApiOperation({ summary: 'Trigger ML accessibility prediction for a building' })
  predict(@Param('buildingId') buildingId: string) {
    return this.predictService.predict(buildingId);
  }
}
