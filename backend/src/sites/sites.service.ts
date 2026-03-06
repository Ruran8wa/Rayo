import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

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
