const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Optional: Add some sample tenants
  const sampleTenants = [
    { name: 'Demo Company', slug: 'demo-company' },
    { name: 'Test Corp', slug: 'test-corp' }
  ];

  for (const tenant of sampleTenants) {
    await prisma.tenant.upsert({
      where: { slug: tenant.slug },
      update: {},
      create: tenant,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
