import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgesService: BadgesService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        user_id: userId,
        building_id: dto.building_id ?? null,
        place_name: dto.place_name ?? null,
        place_address: dto.place_address ?? null,
        scope: dto.scope,
        accessibility_level: dto.accessibility_level,
        comment: dto.comment ?? null,
      },
    });

    this.badgesService.evaluate(userId).catch((err: Error) => {
      this.logger.error(`Badge evaluation failed for ${userId}: ${err.message}`);
    });

    return review;
  }

  async findByBuilding(buildingId: string) {
    return this.prisma.review.findMany({
      where: { building_id: buildingId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { user_id: userId },
      include: {
        building: {
          select: { id: true, building_name: true, site: { select: { name: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
