import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PredictService {
  private readonly logger = new Logger(PredictService.name);
  private readonly mlApiUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.mlApiUrl = process.env.ML_API_URL ?? 'http://localhost:8000';
  }

  async predict(buildingId: string): Promise<{ accessibility_class: string; accessibility_score: number }> {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        site: true,
        floors: {
          include: { services: true },
          orderBy: { floor_level: 'asc' },
        },
      },
    });

    if (!building) {
      throw new NotFoundException(`Building ${buildingId} not found`);
    }

    const payload = {
      site_type: building.site.site_type,
      structure: {
        buildings: [
          {
            building_id: building.id,
            building_name: building.building_name,
            total_floors: building.total_floors,
            entrance: {
              step_free: building.step_free_entrance,
              ramps_present: building.ramps_present,
            },
            vertical_access: {
              elevator_present: building.elevator_present,
              handrails_present: building.handrails_present,
            },
            floors: building.floors.map((floor) => ({
              floor_level: floor.floor_level,
              services: floor.services.map((s) => s.name),
              accessibility: {
                mobility_accessible: floor.mobility_accessible,
                vision_support: {
                  clear_signage: floor.clear_signage,
                  high_contrast_signage: floor.high_contrast_signage,
                },
              },
            })),
          },
        ],
      },
    };

    let result: { accessibility_class: string; accessibility_score: number };

    try {
      const response = await fetch(`${this.mlApiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ML API responded with ${response.status}: ${error}`);
      }

      result = await response.json() as { accessibility_class: string; accessibility_score: number };
    } catch (error) {
      this.logger.error(`Prediction failed for building ${buildingId}: ${(error as Error).message}`);
      throw new InternalServerErrorException('ML prediction failed');
    }

    await this.prisma.building.update({
      where: { id: buildingId },
      data: {
        accessibility_class: result.accessibility_class,
        accessibility_score: result.accessibility_score,
      },
    });

    this.logger.log(
      `Predicted building ${buildingId}: ${result.accessibility_class} (${result.accessibility_score})`,
    );

    return result;
  }
}
