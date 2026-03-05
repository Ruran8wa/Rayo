import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PredictService } from '../predict/predict.service';

@Injectable()
export class BuildingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly predictService: PredictService,
  ) {}

  async search(query: string) {
    return this.prisma.building.findMany({
      where: {
        OR: [
          { building_name: { contains: query, mode: 'insensitive' } },
          { site: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        site: {
          select: { id: true, name: true, site_type: true, address: true },
        },
      },
      take: 20,
    });
  }

  async findById(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        site: {
          select: { id: true, name: true, site_type: true, address: true },
        },
        floors: {
          include: { services: true },
          orderBy: { floor_level: 'asc' },
        },
      },
    });

    if (!building) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }

    return building;
  }

  async getGeoJson(bbox?: string) {
    const where: Record<string, unknown> = {
      lat: { not: null },
      lng: { not: null },
    };

    if (bbox) {
      const [south, west, north, east] = bbox.split(',').map(Number);
      where.lat = { gte: south, lte: north };
      where.lng = { gte: west, lte: east };
    }

    const buildings = await this.prisma.building.findMany({
      where,
      include: {
        site: { select: { id: true, name: true, site_type: true } },
      },
    });

    return {
      type: 'FeatureCollection' as const,
      features: buildings.map((b) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [b.lng, b.lat],
        },
        properties: {
          id: b.id,
          building_name: b.building_name,
          site_name: b.site.name,
          site_type: b.site.site_type,
          accessibility_class: b.accessibility_class,
          accessibility_score: b.accessibility_score,
        },
      })),
    };
  }

  async findNearby(lat: number, lng: number) {
    const delta = 0.05; // ~5.5 km bounding box
    return this.prisma.building.findMany({
      where: {
        lat: { gte: lat - delta, lte: lat + delta },
        lng: { gte: lng - delta, lte: lng + delta },
      },
      include: {
        site: {
          select: { id: true, name: true, site_type: true, address: true },
        },
      },
    });
  }

  async triggerPrediction(buildingId: string) {
    await this.predictService.predict(buildingId);
  }
}
