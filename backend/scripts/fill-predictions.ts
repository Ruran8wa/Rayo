import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { spawn } from 'child_process';
import * as path from 'path';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'ml', 'scripts', 'predict.py');
const VENV_PYTHON = path.resolve(__dirname, '..', '..', 'ml', '.venv', 'bin', 'python3');

function runPrediction(
  payload: Record<string, unknown>,
): Promise<{ accessibility_class: string; accessibility_score: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(VENV_PYTHON, [SCRIPT_PATH]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`predict.py exited with code ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error(`Failed to parse output: ${stdout}`));
      }
    });

    child.on('error', reject);
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function main() {
  const buildings = await prisma.building.findMany({
    where: {
      OR: [{ accessibility_class: null }, { accessibility_score: null }],
    },
    include: {
      site: true,
      floors: { include: { services: true }, orderBy: { floor_level: 'asc' } },
    },
  });

  if (buildings.length === 0) {
    console.log('No buildings with missing predictions found.');
    return;
  }

  console.log(`Found ${buildings.length} building(s) with missing predictions. Running...\n`);

  let success = 0;
  let failed = 0;

  for (const b of buildings) {
    const payload = {
      site_type: b.site.site_type,
      structure: {
        buildings: [
          {
            building_id: b.id,
            building_name: b.building_name,
            total_floors: b.total_floors,
            entrance: { step_free: b.step_free_entrance, ramps_present: b.ramps_present },
            vertical_access: { elevator_present: b.elevator_present, handrails_present: b.handrails_present },
            floors: b.floors.map((f) => ({
              floor_level: f.floor_level,
              services: f.services.map((s) => s.name),
              accessibility: {
                mobility_accessible: f.mobility_accessible,
                vision_support: {
                  clear_signage: f.clear_signage,
                  high_contrast_signage: f.high_contrast_signage,
                },
              },
            })),
          },
        ],
      },
    };

    try {
      const result = await runPrediction(payload);

      await prisma.building.update({
        where: { id: b.id },
        data: {
          accessibility_class: result.accessibility_class,
          accessibility_score: result.accessibility_score,
        },
      });

      console.log(`✅ ${b.building_name}: ${result.accessibility_class} (score: ${result.accessibility_score})`);
      success++;
    } catch (err) {
      console.error(`❌ ${b.building_name}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
