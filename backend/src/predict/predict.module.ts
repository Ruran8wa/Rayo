import { Module } from '@nestjs/common';
import { PredictService } from './predict.service';
import { PredictController } from './predict.controller';

@Module({
  controllers: [PredictController],
  providers: [PredictService],
  exports: [PredictService],
})
export class PredictModule {}
