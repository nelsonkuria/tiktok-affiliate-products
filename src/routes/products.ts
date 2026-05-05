import { searchProduct } from '~/api/products.js';
import { getProductSearchTitle } from '~/api/utils.js';
import type { ProductsResponse } from '~/types/TikTok.js';
import { isWithinDays, startOfUTCDay } from '~/utils/dates.js';
import prisma from '~/utils/prisma.js';
import { getResult, getSellerCredentials } from '~/utils/tiktok.js';

type Product = {
  id: string;
  title: string;
  category: string;
  price?: number;
  region: string;
};

type Seller = { id: string; name: string; link: string };

export async function getAffiliateProduct(input: Product) {
  const { id, title, category, price, region } = input;
  const dbProduct = await fetchDbProduct(id);
  const { product, isCurrent } = dbProduct;

  if (product && isCurrent) return product;

  const { cipher, accessToken } = await getSellerCredentials(region);
  const searchTitle = getProductSearchTitle(title);
  const keywords = searchTitle.split(' ').slice(0, 4);
  const priceRange = price ? { ge: price } : { ge: 1 };

  const filters = { keywords, category, priceRange };
  console.log('filters', filters);

  const loopLimit = 10;
  let nextPageToken: string = '';

  for (let i = 0; i < loopLimit; i++) {
    const { result } = await searchProduct(
      cipher,
      accessToken,
      filters,
      nextPageToken,
      region,
    );

    const { data } = getResult(result) as ProductsResponse;
    const { products, next_page_token } = data;

    if (products.length) {
      // Insert all products to db
      // Or upsert so we update products that already exist
      // Do I care about number of units sold 🤔

      const today = startOfUTCDay(new Date());
      const targetProduct = products.find((p) => p.id === id);

      if (targetProduct) {
        console.log('🟢 Found product');
        // return product with success message
      }
    } else {
      nextPageToken = next_page_token;
    }
  }

  console.log('🔴 Could not find product.');
  // return failure message with null product value
  return null;
}

async function fetchDbProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { tiktokId: id },
    select: {
      title: true,
      mainImage: true,
      detailsLink: true,
      categories: true,
      saleRegion: true,
      originalPrice: true,
      salesPrice: true,
      commission: true,
      unitsSold: true,
      hasInventory: true,
      shop: true,
      lastSync: true,
    },
  });

  if (product) {
    const { shop, lastSync, ...rest } = product;

    const seller = shop as Seller;
    const { id: sid, name } = seller;

    return {
      product: { ...rest, shop: { id: sid, name } },
      isCurrent: isWithinDays('7d', lastSync),
    };
  }

  return { product: null, isCurrent: false };
}
