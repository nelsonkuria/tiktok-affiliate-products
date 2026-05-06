import { searchProduct } from '~/api/products.js';
import { getProductSearchTitle } from '~/api/utils.js';
import type { APIProduct, Event, ProductsResponse } from '~/types/TikTok.js';
import { isWithinDays, startOfUTCDay } from '~/utils/dates.js';
import prisma from '~/utils/prisma.js';
import { getResult, getSellerCredentials } from '~/utils/tiktok.js';

// Maybe also accept url as input?
type Args = {
  id: string;
  title: string;
  category?: string;
  price?: number;
  region?: string;
};

type Seller = { id: string; name: string; link: string };

export type Result = {
  code: 0 | 1;
  status: 'success' | 'error';
  messages: string[] | undefined;
  event: Event;
  data: {
    id: string;
    title: string;
    mainImage: string;
    detailsLink: string;
    categories: { id: string; name: string }[];
    saleRegion: 'US';
    originalPrice: { currency: string; minimum: string; maximum: string };
    salesPrice: { currency: string; minimum: string; maximum: string };
    commission: {
      rate: number;
      amount: string;
      currency: string;
    };
    unitsSold: number;
    hasInventory: boolean;
    shop: {
      id: string | undefined;
      name: string;
    };
  } | null;
};

export async function getAffiliateProduct(args: Record<string, string | number | boolean>) {
  const event: Event = { name: 'products', count: 1 };

  const { id, title, category, price, region } = args as Args;
  const country = region ?? 'US';

  if (!id || !title) {
    return {
      code: 0,
      status: 'error',
      messages: ['Please provide all the required arguments.'],
      event,
      data: null,
    };
  }

  const dbProduct = await fetchDbProduct(id);
  const { product, isCurrent } = dbProduct;

  if (product && isCurrent) {
    console.log('bD Crnt');
    return { code: 1, status: 'success', event, data: { id, ...product } };
  }

  const { cipher, accessToken } = await getSellerCredentials(country);
  const searchTitle = getProductSearchTitle(title);
  const keywords = searchTitle.split(' ').slice(0, 3);
  const priceRange = price ? { ge: price } : { ge: 1 };

  const filters = { keywords, category: category ?? '', priceRange };
  console.log('filters', filters);

  const loopLimit = 10;
  let nextPageToken = '';

  for (let i = 0; i < loopLimit; i++) {
    const { result } = await searchProduct(
      cipher,
      accessToken,
      filters,
      nextPageToken,
      country,
    );

    const { data } = getResult(result) as ProductsResponse;
    const { products, next_page_token } = data;

    if (products.length) {
      const otherProducts = products.filter((p) => p.id !== id);
      await prisma.product.createMany({
        data: otherProducts.map((p) => formatProduct(p)),
        skipDuplicates: true,
      });

      const targetProduct = products.find((p) => p.id === id);
      if (targetProduct) {
        console.log('🟢 Found product', i);
        const formattedProduct = formatProduct(targetProduct);
        const { tiktokId, lastSync, ...returnProduct } = formattedProduct;

        const targetDbProduct = await prisma.product.findUnique({
          where: { tiktokId: id },
          select: { shop: true },
        });

        if (targetDbProduct) {
          const seller = targetDbProduct.shop as Seller;
          const shopData = seller?.id
            ? { id: seller.id, ...formattedProduct.shop }
            : formattedProduct.shop;

          await prisma.product.update({
            where: { tiktokId: id },
            data: { ...formattedProduct, shop: shopData },
          });

          return {
            code: 1,
            status: 'success',
            event,
            data: { id: tiktokId, ...returnProduct, shop: shopData },
          };
        }

        if (!targetDbProduct) {
          await prisma.product.create({
            data: formattedProduct,
          });

          return {
            code: 1,
            status: 'success',
            event,
            data: { id: tiktokId, ...returnProduct },
          };
        }
      }
    } else {
      nextPageToken = next_page_token;
    }
  }

  if (product) return { code: 1, status: 'success', event, data: product };

  console.log('🔴 Could not find product.');
  return {
    code: 0,
    status: 'error',
    event,
    messages: ['Could not find product.'],
    data: product,
  };
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

function formatProduct(product: APIProduct) {
  const {
    id,
    title,
    sale_region,
    category_chains,
    main_image_url,
    detail_link,
    original_price: op,
    sales_price: sp,
    units_sold,
    commission,
    has_inventory,
    shop,
  } = product;

  return {
    tiktokId: id,
    title,
    mainImage: main_image_url,
    detailsLink: detail_link,
    categories: category_chains.map((c) => ({ id: c.id, name: c.local_name })),
    saleRegion: sale_region,
    originalPrice: {
      currency: op.currency,
      minimum: op.minimum_amount,
      maximum: op.maximum_amount,
    },
    salesPrice: {
      currency: sp.currency,
      minimum: sp.minimum_amount,
      maximum: sp.maximum_amount,
    },
    commission: { ...commission, rate: commission.rate / 100 },
    unitsSold: units_sold,
    hasInventory: has_inventory,
    shop,
    lastSync: startOfUTCDay(new Date()),
  };
}
