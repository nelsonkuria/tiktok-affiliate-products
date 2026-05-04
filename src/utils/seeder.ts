import type { Product } from '#/prisma-buzz/generated/prisma/client.js';

import prismaBuzz from './prisma.buzz.js';
import prisma from './prisma.js';

const BATCH_SIZE = 1000;

export async function seedProducts() {
  let cursor = '';
  let count = 0;

  while (true) {
    console.log(`📚 Processing batch ${count + 1}..`);
    const products = await prismaBuzz.product.findMany({
      where: { commission: { not: null } },
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    if (products.length === 0) break;

    await prisma.product.createMany({
      data: [],
      skipDuplicates: true,
    });

    cursor = products[products.length - 1].id;
    count++;
    console.log('✔️ Done');
  }

  console.log(`✅ Syncd ${count} products successfully.`);
}

const formatPayload = (products: Product[]) => {
  const productPayload = products.map((p) => {
    const {
      tiktokId,
      title,
      cover,
      seoUrl,
      categories,
      categoryNames,
      saleRegion,
      price,
      priceRange,
      unitsSold,
      commission,
      sellerId,
      sellerName,
    } = p;
  });
};
