import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const scheduleData = [
  { week: 1, family: '12E', email: 'test@test.com' },
  { week: 2, family: '12D', email: 'test@test.com' },
  { week: 3, family: '12B', email: 'test@test.com' },
  { week: 4, family: '10A', email: 'test@test.com' },
  { week: 5, family: '10B', email: 'nkasbi@gmail.com' },
  { week: 6, family: '10D', email: 'fanfang2014@gmail.com' },
  { week: 7, family: '10E', email: 'test@test.com' },
  { week: 8, family: '10F', email: 'test@test.com' },
  { week: 9, family: '12F', email: 'test@test.com' },
  { week: 10, family: '12E' },
  { week: 11, family: '12D' },
  { week: 12, family: '12B' },
  { week: 13, family: '10A' },
  { week: 14, family: '10B' },
  { week: 15, family: '10D' },
  { week: 16, family: '10E' },
  { week: 17, family: '10F' },
  { week: 18, family: '12F' },
  { week: 19, family: '12E' },
  { week: 20, family: '12D' },
  { week: 21, family: '12B' },
  { week: 22, family: '10A' },
  { week: 23, family: '10B' },
  { week: 24, family: '10D' },
  { week: 25, family: '10E' },
  { week: 26, family: '10F' },
  { week: 27, family: '12F' },
  { week: 28, family: '12E' },
  { week: 29, family: '12D' },
  { week: 30, family: '12B' },
  { week: 31, family: '10A' },
  { week: 32, family: '10B' },
  { week: 33, family: '10D' },
  { week: 34, family: '10E' },
  { week: 35, family: '10F' },
  { week: 36, family: '12F' },
  { week: 37, family: '12E' },
  { week: 38, family: '12D' },
  { week: 39, family: '12B' },
  { week: 40, family: '10A' },
  { week: 41, family: '10B' },
  { week: 42, family: '10D' },
  { week: 43, family: '10E' },
  { week: 44, family: '10F' },
  { week: 45, family: '12F' },
  { week: 46, family: '12E' },
  { week: 47, family: '12D' },
  { week: 48, family: '12B' },
  { week: 49, family: '10A' },
  { week: 50, family: '10B' },
  { week: 51, family: '10D' },
  { week: 52, family: '10E' },
]

const joinCodes: Record<string, string> = {
  '10F': 'join-10f',
  '12F': 'join-12f',
  '12E': 'join-12e',
  '12D': 'join-12d',
  '12B': 'join-12b',
  '10A': 'join-10a',
  '10B': 'join-10b',
  '10D': 'join-10d',
  '10E': 'join-10e',
}

async function main() {
  console.log('🌱 Starting seeding...')
  const count = await prisma.weekAssignment.count()

  if (count === 0) {
    // Seed data if the table is empty
    console.log('Seeding database with initial data...')

    for (const [i, entry] of scheduleData.entries()) {
      // Ensure family exists
      let family = await prisma.family.findFirst({
        where: { name: entry.family },
      })

      if (!family) {
        family = await prisma.family.create({
          data: {
            name: entry.family,
            email: entry.email || `${entry.family.toLowerCase()}@example.com`,
            phone: '+1234567890',
            order: 0,
            joinCode:
              joinCodes[entry.family] || `code-${entry.family.toLowerCase()}`,
          },
        })
      }

      // Create the assignment
      await prisma.weekAssignment.create({
        data: {
          week: entry.week,
          familyId: family.id,
        },
      })
    }
    console.log('✅ Seed completed!')
  } else {
    console.log('💥 Database already contains data.')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
