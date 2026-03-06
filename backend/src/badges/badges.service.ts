import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'community' | 'explorer' | 'impact';
  requirement: string;
  required: number;
  evaluate: (counts: BadgeCounts) => number;
}

interface BadgeCounts {
  reviewCount: number;
  saveCount: number;
  commentedReviewCount: number;
  distinctSiteCount: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-review',
    name: 'First Voice',
    description: 'Submitted your first accessibility review.',
    category: 'community',
    requirement: 'Write 1 review',
    required: 1,
    evaluate: (c) => Math.min(c.reviewCount, 1),
  },
  {
    id: 'advocate',
    name: 'Accessibility Advocate',
    description: 'Helping the community with 5 reviews.',
    category: 'community',
    requirement: 'Write 5 reviews',
    required: 5,
    evaluate: (c) => Math.min(c.reviewCount, 5),
  },
  {
    id: 'champion',
    name: 'Community Champion',
    description: 'A pillar of the accessibility community.',
    category: 'community',
    requirement: 'Write 20 reviews',
    required: 20,
    evaluate: (c) => Math.min(c.reviewCount, 20),
  },
  {
    id: 'first-save',
    name: 'Scout',
    description: 'Saved your first accessible place.',
    category: 'explorer',
    requirement: 'Save 1 place',
    required: 1,
    evaluate: (c) => Math.min(c.saveCount, 1),
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Building a personal map of accessible places.',
    category: 'explorer',
    requirement: 'Save 5 places',
    required: 5,
    evaluate: (c) => Math.min(c.saveCount, 5),
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'An extensive collection of accessible places.',
    category: 'explorer',
    requirement: 'Save 15 places',
    required: 15,
    evaluate: (c) => Math.min(c.saveCount, 15),
  },
  {
    id: 'detail-oriented',
    name: 'Detail-Oriented',
    description: 'Went the extra mile with a detailed review.',
    category: 'impact',
    requirement: 'Write a review with a comment',
    required: 1,
    evaluate: (c) => Math.min(c.commentedReviewCount, 1),
  },
  {
    id: 'full-reporter',
    name: 'Full Reporter',
    description: 'Reviewed buildings across multiple sites.',
    category: 'impact',
    requirement: 'Review buildings in 3 different sites',
    required: 3,
    evaluate: (c) => Math.min(c.distinctSiteCount, 3),
  },
];

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluate(userId: string): Promise<string[]> {
    const [reviewCount, saveCount, commentedReviewCount, distinctSiteCount, alreadyEarned] =
      await Promise.all([
        this.prisma.review.count({ where: { user_id: userId } }),
        this.prisma.savedPlace.count({ where: { user_id: userId } }),
        this.prisma.review.count({
          where: { user_id: userId, comment: { not: null } },
        }),
        this.prisma.review
          .findMany({
            where: { user_id: userId, building_id: { not: null } },
            select: { building: { select: { site_id: true } } },
            distinct: ['building_id'],
          })
          .then((rows) => new Set(rows.map((r) => r.building?.site_id)).size),
        this.prisma.userBadge.findMany({
          where: { user_id: userId },
          select: { badge_id: true },
        }),
      ]);

    const counts: BadgeCounts = {
      reviewCount,
      saveCount,
      commentedReviewCount,
      distinctSiteCount,
    };

    const earnedIds = new Set(alreadyEarned.map((b) => b.badge_id));
    const newlyEarned: string[] = [];

    for (const def of BADGE_DEFINITIONS) {
      if (earnedIds.has(def.id)) continue;
      if (def.evaluate(counts) >= def.required) {
        newlyEarned.push(def.id);
      }
    }

    if (newlyEarned.length > 0) {
      await this.prisma.userBadge.createMany({
        data: newlyEarned.map((badge_id) => ({ user_id: userId, badge_id })),
        skipDuplicates: true,
      });
      this.logger.log(`Awarded badges to ${userId}: ${newlyEarned.join(', ')}`);
    }

    return newlyEarned;
  }

  async getUserBadges(userId: string) {
    const earned = await this.prisma.userBadge.findMany({
      where: { user_id: userId },
    });

    const earnedMap = new Map(earned.map((b) => [b.badge_id, b.earned_at]));

    const [reviewCount, saveCount, commentedReviewCount, distinctSiteCount] =
      await Promise.all([
        this.prisma.review.count({ where: { user_id: userId } }),
        this.prisma.savedPlace.count({ where: { user_id: userId } }),
        this.prisma.review.count({
          where: { user_id: userId, comment: { not: null } },
        }),
        this.prisma.review
          .findMany({
            where: { user_id: userId, building_id: { not: null } },
            select: { building: { select: { site_id: true } } },
            distinct: ['building_id'],
          })
          .then((rows) => new Set(rows.map((r) => r.building?.site_id)).size),
      ]);

    const counts: BadgeCounts = {
      reviewCount,
      saveCount,
      commentedReviewCount,
      distinctSiteCount,
    };

    return BADGE_DEFINITIONS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      requirement: def.requirement,
      required: def.required,
      progress: def.evaluate(counts),
      earned: earnedMap.has(def.id),
      earned_at: earnedMap.get(def.id)?.toISOString(),
    }));
  }
}
