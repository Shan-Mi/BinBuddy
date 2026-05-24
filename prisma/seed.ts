import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const YEAR = 2026

// Rotation order as shown on the physical building schedule.
// Confirmed anchor: 2024-W44 = 10F (index 0), repeating every 9 families.
const ROTATION: string[] = ['10F', '12F', '12E', '12D', '12B', '10A', '10B', '10D', '10E']

// The schedule resets to 10F at week 1 every year (confirmed from physical building notice).
const YEAR_OFFSET = 0

function familyForWeek(week: number): string {
  return ROTATION[(week - 1 + YEAR_OFFSET) % ROTATION.length]
}

// Families in rotation order (order field reflects true rotation sequence)
const families = [
  { name: '10F', joinCode: 'join-10f', order: 1, email: '10f@example.com' },
  { name: '12F', joinCode: 'join-12f', order: 2, email: '12f@example.com' },
  { name: '12E', joinCode: 'join-12e', order: 3, email: '12e@example.com' },
  { name: '12D', joinCode: 'join-12d', order: 4, email: '12d@example.com' },
  { name: '12B', joinCode: 'join-12b', order: 5, email: '12b@example.com' },
  { name: '10A', joinCode: 'join-10a', order: 6, email: '10a@example.com' },
  { name: '10B', joinCode: 'join-10b', order: 7, email: '10b@example.com' },
  { name: '10D', joinCode: 'join-10d', order: 8, email: '10d@example.com' },
  { name: '10E', joinCode: 'join-10e', order: 9, email: '10e@example.com' },
]

async function main() {
  console.log('🌱 Starting seed...')
  console.log(`Year: ${YEAR}, offset: ${YEAR_OFFSET} (W1 = ${familyForWeek(1)})`)

  // Upsert families
  const familyMap: Record<string, string> = {}
  for (const f of families) {
    const family = await prisma.family.upsert({
      where: { joinCode: f.joinCode },
      update: { order: f.order },
      create: { name: f.name, joinCode: f.joinCode, order: f.order, email: f.email, phone: '' },
    })
    familyMap[f.name] = family.id
  }
  console.log(`✅ ${families.length} families upserted`)

  // Seed all 52 weeks
  let seeded = 0
  for (let week = 1; week <= 52; week++) {
    const name = familyForWeek(week)
    await prisma.weekAssignment.upsert({
      where: { week_year: { week, year: YEAR } },
      update: { familyId: familyMap[name] }, // update so re-running fixes wrong assignments
      create: { week, year: YEAR, familyId: familyMap[name] },
    })
    seeded++
  }

  // Spot-check log for the first few weeks
  console.log('Spot-check (first 9 weeks):')
  for (let w = 1; w <= 9; w++) {
    console.log(`  W${w}: ${familyForWeek(w)}`)
  }
  console.log(`✅ ${seeded} week assignments seeded for ${YEAR}`)

  // Seed admin user (emailVerified set so NextAuth treats it as a valid account)
  await prisma.user.upsert({
    where: { email: 'admin@binbuddy.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@binbuddy.com',
      name: 'Admin',
      isAdmin: true,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user seeded (admin@binbuddy.com)')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
