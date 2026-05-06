import prisma from '~/utils/prisma.js';

async function seeder() {
  const count = await prisma.product.count();
  console.log(`${count} total products.`);
}

await seeder();

console.log('✅ Seed complete!');
