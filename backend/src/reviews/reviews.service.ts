import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    return this.prisma.review.create({
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
  }

  async findByBuilding(buildingId: string) {
    return this.prisma.review.findMany({
      where: { building_id: buildingId },
      orderBy: { created_at: 'desc' },
    });
  }
}
