import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

type AuthUser = { userId: string };

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Submit an accessibility review' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, dto);
  }

  @Get('building/:buildingId')
  @ApiOperation({ summary: 'Get all reviews for a building' })
  findByBuilding(@Param('buildingId') buildingId: string) {
    return this.reviewsService.findByBuilding(buildingId);
  }
}
