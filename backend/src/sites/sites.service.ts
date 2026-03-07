import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingsService } from '../buildings/buildings.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/upsert-site.dto';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly buildingsService: BuildingsService,
  ) {}

  async create(dto: CreateSiteDto) {
    return this.prisma.site.create({ data: dto });
  }

  async update(id: string, dto: UpdateSiteDto) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException(`Site ${id} not found`);

    const updated = await this.prisma.site.update({ where: { id }, data: dto });

    // Re-predict all buildings if site_type changed (it's part of the ML payload)
    if (dto.site_type && dto.site_type !== site.site_type) {
      this.repredictAllBuildings(id);
    }

    return updated;
  }

  private repredictAllBuildings(siteId: string) {
    this.prisma.building
      .findMany({ where: { site_id: siteId }, select: { id: true } })
      .then((buildings) => {
        for (const b of buildings) {
          this.buildingsService.triggerPrediction(b.id);
        }
      })
      .catch((err: Error) => {
        this.logger.error(`Failed to re-predict buildings for site ${siteId}: ${err.message}`);
      });
  }

  async findAll() {
    return this.prisma.site.findMany({
      include: {
        _count: { select: { buildings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBuildings(siteId: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });

    if (!site) {
      throw new NotFoundException(`Site with id ${siteId} not found`);
    }

    return this.prisma.building.findMany({
      where: { site_id: siteId },
      select: {
        id: true,
        building_name: true,
        total_floors: true,
        accessibility_class: true,
        accessibility_score: true,
        step_free_entrance: true,
        elevator_present: true,
        lat: true,
        lng: true,
      },
      orderBy: { building_name: 'asc' },
    });
  }

  async findById(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        buildings: {
          select: {
            id: true,
            building_name: true,
            total_floors: true,
            accessibility_class: true,
            accessibility_score: true,
            step_free_entrance: true,
            elevator_present: true,
            lat: true,
            lng: true,
          },
          orderBy: { building_name: 'asc' },
        },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }

    return site;
  }
}
