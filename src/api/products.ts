import type { FetchResult, ProductsResponse } from '~/types/TikTok.js';
import { ttsFetch } from '~/utils/fetch.js';

export async function getProduct(
  cipher: string,
  token: string,
  filters: {
    keywords?: string[];
    category: number;
    priceRange: { lt?: number; ge: number };
  },
  pageToken: string,
  region: string,
) {
  let result: FetchResult<ProductsResponse>;
  const page = pageToken ? { page_token: pageToken } : null;
  const query = { shop_cipher: cipher, page_size: '20', ...page };
  const body = {
    title_keywords: filters.keywords,
    category: { id: `${filters.category}` },
    sales_price_range: {
      amount_ge: `${filters.priceRange.ge}`,
    },
  };

  try {
    const res = await ttsFetch(
      'POST',
      '/affiliate_seller/202405/open_collaborations/products/search',
      false,
      token,
      region,
      body,
      query,
    );

    result = { status: 'success', result: () => res };
  } catch (e) {
    console.error('Could not fetch open collaboration products', e);
    result = {
      status: 'error',
      error: 'Failed to fetch open collaboration products.',
    };
  }

  return result;
}
