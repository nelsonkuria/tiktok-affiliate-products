import type { Product } from '#/prisma-buzz/generated/prisma/client.js';

import { startOfUTCDay } from './helpers.js';
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
      price,
      priceRange,
      comparePrice,
      unitsSold,
      commission,
      sellerId,
      sellerName,
    } = p;

    const productCategories = categories.map((c, idx) => ({
      id: `${c}`,
      name: categoryNames[idx],
    }));

    const range = priceRange ? priceRange.split('-') : [];
    const prices = range.length
      ? { minimum: range[0], maximum: range[1] }
      : { minimum: price, maximum: comparePrice ?? '' };

    return {
      tiktokId,
      title,
      mainImage: cover,
      detailsLink: seoUrl,
      categories: productCategories,
      saleRegion: 'US',
      originalPrice: { currency: 'USD', ...prices },
      salesPrice: { currency: 'USD', ...prices },
      commission: {
        rate: commission ? commission / 100 : null,
        amount: '',
        currency: 'USD',
      },
      unitsSold,
      hasInventory: true,
      shop: {
        id: sellerId,
        name: sellerName,
        link: `https://www.tiktok.com/shop/store/gopure/${sellerId}`,
      },
      lastSync: startOfUTCDay(new Date()),
    };
  });
};
