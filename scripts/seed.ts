import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main () {
  // Crée la société BrandNewDay
  const brandNewDay = await prisma.company.upsert({
    where: { name: 'BrandNewDay' },
    update: {},
    create: { name: 'BrandNewDay' }
  })

  // Crée l'utilisateur SuperAdmin sans société (accès global)
  await prisma.user.upsert({
    where: { email: 'angelo.geraci@soprism.com' },
    update: { role: UserRole.SUPERADMIN },
    create: {
      email: 'angelo.geraci@soprism.com',
      password: '1234',
      role: UserRole.SUPERADMIN
    }
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 