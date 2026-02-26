import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface NearbyServiceRow {
  service_id: string;
  service_name: string;
  is_critical: boolean;
  is_accessible: boolean;
  floor_id: string;
  floor_level: number;
  mobility_accessible: boolean;
  building_id: string;
  building_name: string;
  accessibility_class: string | null;
  accessibility_score: number | null;
  lat: number;
  lng: number;
  site_name: string;
  site_type: string;
  distance_km: number;
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchNearby(q: string, lat?: number, lng?: number, radius = 5) {
    if (lat !== undefined && lng !== undefined) {
      const pattern = `%${q}%`;

      const results = await this.prisma.$queryRaw<NearbyServiceRow[]>`
        WITH matched AS (
          SELECT
            s.id            AS service_id,
            s.name          AS service_name,
            s.is_critical,
            s.is_accessible,
            f.id            AS floor_id,
            f.floor_level,
            f.mobility_accessible,
            b.id            AS building_id,
            b.building_name,
            b.accessibility_class,
            b.accessibility_score,
            b.lat,
            b.lng,
            si.name         AS site_name,
            si.site_type,
            (
              6371 * acos(
                LEAST(GREATEST(
                  cos(radians(${lat})) * cos(radians(b.lat))
                  * cos(radians(b.lng) - radians(${lng}))
                  + sin(radians(${lat})) * sin(radians(b.lat)),
                -1), 1)
              )
            ) AS distance_km
          FROM services s
          JOIN floors f   ON s.floor_id = f.id
          JOIN buildings b ON f.building_id = b.id
          JOIN sites si    ON b.site_id = si.id
          WHERE s.name ILIKE ${pattern}
            AND b.lat IS NOT NULL
            AND b.lng IS NOT NULL
        )
        SELECT * FROM matched
        WHERE distance_km <= ${radius}
        ORDER BY distance_km ASC
        LIMIT 50
      `;

      return results.map((r) => ({
        service: {
          id: r.service_id,
          name: r.service_name,
          is_critical: r.is_critical,
          is_accessible: r.is_accessible,
        },
        floor: {
          id: r.floor_id,
          floor_level: r.floor_level,
          mobility_accessible: r.mobility_accessible,
        },
        building: {
          id: r.building_id,
          building_name: r.building_name,
          accessibility_class: r.accessibility_class,
          accessibility_score: r.accessibility_score
            ? Number(r.accessibility_score)
            : null,
          lat: Number(r.lat),
          lng: Number(r.lng),
          site_name: r.site_name,
          site_type: r.site_type,
        },
        distance_km: Number(r.distance_km),
      }));
    }

    const services = await this.prisma.service.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: {
        floor: {
          include: {
            building: {
              include: {
                site: { select: { name: true, site_type: true } },
              },
            },
          },
        },
      },
      take: 50,
    });

    return services.map((s) => ({
      service: {
        id: s.id,
        name: s.name,
        is_critical: s.is_critical,
        is_accessible: s.is_accessible,
      },
      floor: {
        id: s.floor.id,
        floor_level: s.floor.floor_level,
        mobility_accessible: s.floor.mobility_accessible,
      },
      building: {
        id: s.floor.building.id,
        building_name: s.floor.building.building_name,
        accessibility_class: s.floor.building.accessibility_class,
        accessibility_score: s.floor.building.accessibility_score,
        lat: s.floor.building.lat,
        lng: s.floor.building.lng,
        site_name: s.floor.building.site.name,
        site_type: s.floor.building.site.site_type,
      },
      distance_km: null,
    }));
  }
}
