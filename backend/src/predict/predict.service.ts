import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class PredictService {
  private readonly logger = new Logger(PredictService.name);
  private readonly scriptPath: string;

  constructor(private readonly prisma: PrismaService) {
    this.scriptPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'ml',
      'scripts',
      'predict.py',
    );
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

    const buildingJson = {
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
      result = await this.runPython(JSON.stringify(buildingJson));
    } catch (error) {
      this.logger.error(
        `Prediction failed for building ${buildingId}: ${(error as Error).message}`,
      );
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

  private runPython(
    input: string,
  ): Promise<{ accessibility_class: string; accessibility_score: number }> {
    return new Promise((resolve, reject) => {
      const venvPython = path.resolve(this.scriptPath, '..', '..', '.venv', 'bin', 'python3');
      const child = spawn(venvPython, [this.scriptPath]);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(
            new Error(`predict.py exited with code ${code}: ${stderr}`),
          );
          return;
        }
        if (stderr) {
          this.logger.warn(`predict.py stderr: ${stderr}`);
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          reject(new Error(`Failed to parse predict.py output: ${stdout}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to spawn predict.py: ${err.message}`));
      });

      child.stdin.write(input);
      child.stdin.end();
    });
  }
}
