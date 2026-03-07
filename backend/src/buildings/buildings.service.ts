import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PredictService } from '../predict/predict.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/upsert-building.dto';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictService: PredictService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateBuildingDto) {
    const building = await this.prisma.building.create({ data: dto });
    this.runPrediction(building.id);
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto) {
    const building = await this.prisma.building.findUnique({ where: { id } });
    if (!building) throw new NotFoundException(`Building ${id} not found`);
    const updated = await this.prisma.building.update({ where: { id }, data: dto });
    this.runPrediction(id);
    return updated;
  }

  private runPrediction(buildingId: string) {
    this.predictService.predict(buildingId).catch((err: Error) => {
      this.logger.error(`Background prediction failed for building ${buildingId}: ${err.message}`);
    });
  }

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

  async geocodeAll() {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return { error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' };
    }

    const buildings = await this.prisma.building.findMany({
      include: { site: { select: { name: true, address: true } } },
    });

    const results = { updated: 0, skipped: 0, failed: [] as string[] };

    for (const building of buildings) {
      const query = `${building.building_name} Kigali Rwanda`;
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
        url.searchParams.set('input', query);
        url.searchParams.set('inputtype', 'textquery');
        url.searchParams.set('fields', 'geometry,name');
        url.searchParams.set('locationbias', 'circle:20000@-1.9441,30.0619');
        url.searchParams.set('key', apiKey);

        const res = await fetch(url.toString());
        const json = await res.json() as {
          status: string;
          candidates?: { geometry: { location: { lat: number; lng: number } }; name: string }[];
        };

        if (json.status !== 'OK' || !json.candidates?.length) {
          results.skipped++;
          continue;
        }

        const { lat, lng } = json.candidates[0].geometry.location;
        await this.prisma.building.update({
          where: { id: building.id },
          data: { lat, lng },
        });
        this.logger.log(`Geocoded "${building.building_name}" → (${lat}, ${lng})`);
        results.updated++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.failed.push(`${building.building_name}: ${message}`);
      }

      // Respect Google's rate limit (10 req/s on free tier)
      await new Promise((r) => setTimeout(r, 120));
    }

    return results;
  }
}
