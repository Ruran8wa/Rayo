import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------- helpers ----------

const CRITICAL_SERVICES = new Set([
  'icu',
  'picu',
  'nicu',
  'emergency',
  'pharmacy',
  'sub_pharmacy',
  'distribution_pharmacy',
  'laboratory',
  'hospitalization',
  'labor',
  'neonatology',
  'radio_theraphy',
  'scanner',
  'mri',
  'registrar',
  'library',
  'wellness_center',
  'sick_bay',
  'cashier',
  'customer_care',
  'insurance',
  'reception',
]);

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

function isCritical(serviceName: string): boolean {
  return CRITICAL_SERVICES.has(normalize(serviceName));
}

function isServiceAccessible(
  floorLevel: number,
  mobilityAccessible: boolean,
  stepFreeEntrance: boolean,
  elevatorPresent: boolean,
): boolean {
  const floorReachable = floorLevel === 0 ? stepFreeEntrance : elevatorPresent;
  return mobilityAccessible && floorReachable;
}

// Approximate site coordinates in Kigali
const SITE_COORDS: Record<
  string,
  { lat: number; lng: number; address: string }
> = {
  SCHOOL_ALU_001: {
    lat: -1.9028,
    lng: 30.1126,
    address: 'Bumbogo, Gasabo, Kigali',
  },
  Hospital_RMH_0001: {
    lat: -1.9702,
    lng: 30.1127,
    address: 'Nyarugunga, Kicukiro, Kigali',
  },
};

// ---------- prediction helper ----------

function runPrediction(
  buildingJson: Record<string, unknown>,
  scriptPath: string,
): Promise<{ accessibility_class: string; accessibility_score: number }> {
  return new Promise((resolve, reject) => {
    const venvPython = path.resolve(__dirname, '..', '..', 'ml', '.venv', 'bin', 'python3');
    const child = spawn(venvPython, [scriptPath]);
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
        reject(new Error(`predict.py exited with code ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error(`Failed to parse predict.py output: ${stdout}`));
      }
    });

    child.on('error', reject);
    child.stdin.write(JSON.stringify(buildingJson));
    child.stdin.end();
  });
}

// ---------- seed one site file ----------

async function seedSite(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const site = JSON.parse(raw);

  const coords = SITE_COORDS[site.site_id] || {
    lat: -1.95,
    lng: 30.06,
    address: 'Kigali, Rwanda',
  };

  const createdSite = await prisma.site.create({
    data: {
      name: site.site_id.replace(/_/g, ' '),
      site_type: site.site_type,
      address: coords.address,
      lat: coords.lat,
      lng: coords.lng,
    },
  });

  console.log(`Created site: ${createdSite.name}`);

  const buildings = site.structure?.buildings || site.buildings || [];

  for (const building of buildings) {
    const entrance = building.entrance || {};
    const vertical = building.vertical_access || {};

    const stepFree = Boolean(entrance.step_free);
    const elevator = Boolean(vertical.elevator_present);
    const handrails = Boolean(vertical.handrails_present);
    const ramps = Boolean(entrance.ramps_present);

    // Slight random offset so buildings aren't stacked on the same point
    const buildingLat = coords.lat + (Math.random() - 0.5) * 0.002;
    const buildingLng = coords.lng + (Math.random() - 0.5) * 0.002;

    const createdBuilding = await prisma.building.create({
      data: {
        site_id: createdSite.id,
        building_name: building.building_name,
        total_floors: building.total_floors,
        step_free_entrance: stepFree,
        elevator_present: elevator,
        handrails_present: handrails,
        ramps_present: ramps,
        lat: buildingLat,
        lng: buildingLng,
      },
    });

    console.log(`  Created building: ${createdBuilding.building_name}`);

    for (const floor of building.floors || []) {
      const floorLevel = parseInt(String(floor.floor_level), 10) || 0;
      const acc = floor.accessibility || {};
      const vision = acc.vision_support || {};
      const mobilityAccessible = Boolean(acc.mobility_accessible);
      const clearSignage = Boolean(vision.clear_signage);
      const highContrast = Boolean(vision.high_contrast_signage);

      const createdFloor = await prisma.floor.create({
        data: {
          building_id: createdBuilding.id,
          floor_level: floorLevel,
          mobility_accessible: mobilityAccessible,
          clear_signage: clearSignage,
          high_contrast_signage: highContrast,
        },
      });

      const services: string[] = floor.services || [];
      for (const svcName of services) {
        const accessible = isServiceAccessible(
          floorLevel,
          mobilityAccessible,
          stepFree,
          elevator,
        );

        await prisma.service.create({
          data: {
            floor_id: createdFloor.id,
            name: svcName,
            is_critical: isCritical(svcName),
            is_accessible: accessible,
          },
        });
      }

      console.log(`    Floor ${floorLevel}: ${services.length} services`);
    }
  }
}

// ---------- main ----------

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data (order respects FK constraints)
  await prisma.savedPlace.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.service.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.site.deleteMany();

  console.log('Cleared existing data.\n');

  const dataDir = path.resolve(
    __dirname,
    '..',
    '..',
    'ml',
    'data',
    'real_world',
  );
  const aluPath = path.join(dataDir, 'ALU.json');
  const rmhPath = path.join(dataDir, 'RMH.json');

  if (fs.existsSync(aluPath)) {
    await seedSite(aluPath);
  } else {
    console.warn(`⚠️  ALU.json not found at ${aluPath}`);
  }

  if (fs.existsSync(rmhPath)) {
    await seedSite(rmhPath);
  } else {
    console.warn(`⚠️  RMH.json not found at ${rmhPath}`);
  }

  // ---------- trigger predictions ----------
  console.log('\n🔮 Running predictions...');

  const predictScript = path.resolve(
    __dirname,
    '..',
    '..',
    'ml',
    'scripts',
    'predict.py',
  );

  if (!fs.existsSync(predictScript)) {
    console.warn(
      `⚠️  predict.py not found at ${predictScript}. Skipping predictions.`,
    );
    console.log('\n✨ Seeding complete!');
    return;
  }

  const buildings = await prisma.building.findMany({
    include: {
      site: true,
      floors: {
        include: { services: true },
        orderBy: { floor_level: 'asc' },
      },
    },
  });

  for (const b of buildings) {
    try {
      const buildingJson = {
        site_type: b.site.site_type,
        structure: {
          buildings: [
            {
              building_id: b.id,
              building_name: b.building_name,
              total_floors: b.total_floors,
              entrance: {
                step_free: b.step_free_entrance,
                ramps_present: b.ramps_present,
              },
              vertical_access: {
                elevator_present: b.elevator_present,
                handrails_present: b.handrails_present,
              },
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

      const result = await runPrediction(buildingJson, predictScript);

      await prisma.building.update({
        where: { id: b.id },
        data: {
          accessibility_class: result.accessibility_class,
          accessibility_score: result.accessibility_score,
        },
      });

      console.log(
        `  ✅ ${b.building_name}: ${result.accessibility_class} (${result.accessibility_score})`,
      );
    } catch (error) {
      console.error(`  ❌ ${b.building_name}: ${(error as Error).message}`);
    }
  }

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
