import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { PreferencesDto } from './dto/preferences.dto';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private adminClient: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly badgesService: BadgesService,
  ) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceKey = this.configService.getOrThrow<string>('SUPABASE_API_SECRET');
    this.adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async getBadges(userId: string) {
    return this.badgesService.getUserBadges(userId);
  }

  async getStats(userId: string) {
    const [reviewCount, saveCount, badgeCount] = await Promise.all([
      this.prisma.review.count({ where: { user_id: userId } }),
      this.prisma.savedPlace.count({ where: { user_id: userId } }),
      this.prisma.userBadge.count({ where: { user_id: userId } }),
    ]);
    return { reviewCount, saveCount, badgeCount };
  }

  async listUsers() {
    const { data, error } = await this.adminClient.auth.admin.listUsers();
    if (error) throw new InternalServerErrorException(error.message);
    return {
      users: data.users.map(({ id, email, created_at, last_sign_in_at }) => ({
        id,
        email,
        created_at,
        last_sign_in_at,
      })),
    };
  }

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userPreference.findUnique({
      where: { user_id: userId },
    });
    return prefs || null;
  }

  async upsertPreferences(userId: string, dto: PreferencesDto) {
    const existing = await this.prisma.userPreference.findUnique({
      where: { user_id: userId },
    });

    const disability_type =
      dto.disability_type ?? existing?.disability_type ?? '';

    const mergedPreferences = {
      ...(existing?.preferences as Record<string, unknown> | null ?? {}),
      ...dto.preferences,
    };

    return this.prisma.userPreference.upsert({
      where: { user_id: userId },
      update: {
        ...(dto.disability_type !== undefined && { disability_type }),
        preferences: mergedPreferences as Prisma.InputJsonValue,
      },
      create: {
        user_id: userId,
        disability_type,
        preferences: mergedPreferences as Prisma.InputJsonValue,
      },
    });
  }

  async getSavedPlaces(userId: string) {
    return this.prisma.savedPlace.findMany({
      where: { user_id: userId },
      include: {
        building: {
          include: {
            site: { select: { id: true, name: true, site_type: true } },
          },
        },
      },
      orderBy: { saved_at: 'desc' },
    });
  }

  async savePlace(userId: string, buildingId: string) {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException(`Building ${buildingId} not found`);
    }

    let savedPlace;
    try {
      savedPlace = await this.prisma.savedPlace.create({
        data: { user_id: userId, building_id: buildingId },
        include: {
          building: {
            include: {
              site: { select: { id: true, name: true, site_type: true } },
            },
          },
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Building already saved');
      }
      throw error;
    }

    // Fire-and-forget badge evaluation
    this.badgesService.evaluate(userId).catch((err: Error) => {
      this.logger.error(`Badge evaluation failed for ${userId}: ${err.message}`);
    });

    return savedPlace;
  }

  async removePlace(userId: string, id: string) {
    const place = await this.prisma.savedPlace.findFirst({
      where: { id, user_id: userId },
    });

    if (!place) {
      throw new NotFoundException('Saved place not found');
    }

    await this.prisma.savedPlace.delete({ where: { id } });
    return { deleted: true };
  }
}
