import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PreferencesDto } from './dto/preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userPreference.findUnique({
      where: { user_id: userId },
    });

    return prefs || null;
  }

  async upsertPreferences(userId: string, dto: PreferencesDto) {
    return this.prisma.userPreference.upsert({
      where: { user_id: userId },
      update: {
        disability_type: dto.disability_type,
        preferences: dto.preferences as Prisma.InputJsonValue,
      },
      create: {
        user_id: userId,
        disability_type: dto.disability_type,
        preferences: dto.preferences as Prisma.InputJsonValue,
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

    try {
      return await this.prisma.savedPlace.create({
        data: {
          user_id: userId,
          building_id: buildingId,
        },
        include: {
          building: {
            include: {
              site: { select: { id: true, name: true, site_type: true } },
            },
          },
        },
      });
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Building already saved');
      }
      throw error;
    }
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
