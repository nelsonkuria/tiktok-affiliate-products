import { getProductSearchTitle } from '~/api/utils.js';
import { isWithinDays } from '~/utils/dates.js';
import prisma from '~/utils/prisma.js';
import { getSellerCredentials } from '~/utils/tiktok.js';

type Product = {
  id: true;
  title: string;
  category: string;
  price?: number;
  region: string;
};

type Shop = { id: string; name: string; link: string };

export async function getAffiliateProduct(input: Product) {
  const { id, title, category, price, region } = input;
  const { cipher, accessToken } = await getSellerCredentials(region);
  const searchTitle = getProductSearchTitle(title);
  const keywords = searchTitle.split(' ').slice(0, 4);
  const priceRange = price ? { ge: price } : { ge: 1 };

  const filters = { keywords, category, priceRange };
  console.log('filters', filters);
}
