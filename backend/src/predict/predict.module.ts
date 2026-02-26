import { Module } from '@nestjs/common';
import { PredictService } from './predict.service';

@Module({
  providers: [PredictService],
  exports: [PredictService],
})
export class PredictModule {}
