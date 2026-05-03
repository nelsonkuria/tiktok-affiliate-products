import type { AccessTokenResponse } from '../types/TikTok.js';
import prisma from './prisma.tsc.js';

const getTimeStamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * We cache this query for one hour only
 * This way, if for some reason we're unable to retrieve the seller and have to fallback,
 * instead of invalidating the query using the flag, which would happen for each query,
 * we just wait for the cache to invalidate automatically after an hour
 */
const getSeller = async (region: string) => {
  const seller = await prisma.seller.findFirst({
    where: { region },
    select: {
      id: true,
      connection: {
        select: {
          accessToken: true,
          accessTokenExpiry: true,
          refreshToken: true,
          refreshTokenExpiry: true,
        },
      },
      shops: { take: 1, select: { cipher: true } },
    },
    // cacheStrategy: { ttl: 60 * 60, swr: 60, tags: ['get_seller'] },
  });

  return seller ?? null;
};

export const getRegionCredentials = (region: string) => {
  const appKey = (
    region === 'us' ? process.env.US_APP_KEY : process.env.FALLBACK_APP_KEY
  ) as string;
  const appSecret = (
    region === 'us' ? process.env.US_APP_SECRET : process.env.FALLBACK_APP_SECRET
  ) as string;
  return { appKey, appSecret };
};

export const refreshAccessToken = async (
  refreshToken: string,
  region: string,
): Promise<AccessTokenResponse> => {
  const { appKey, appSecret } = getRegionCredentials(region);

  const response = await fetch(
    `https://auth.tiktok-shops.com/api/v2/token/refresh?${new URLSearchParams({
      app_key: appKey as string,
      app_secret: appSecret as string,
      refresh_token: refreshToken as string,
      grant_type: 'refresh_token',
    })}`,
  );

  if (!response.ok) {
    throw new Error('Failed to refresh access token.');
  }

  return response.json();
};

const refreshToken = async (sellerId: string, refresh: string, region: string) => {
  const result = await refreshAccessToken(refresh, region);
  const { code, data } = result;
  const { access_token, access_token_expire_in, refresh_token, refresh_token_expire_in } =
    data;

  if (code === 0) {
    await prisma.seller.update({
      where: { id: sellerId },
      data: {
        connection: {
          update: {
            accessToken: access_token,
            accessTokenExpiry: `${access_token_expire_in}`,
            refreshToken: refresh_token,
            refreshTokenExpiry: `${refresh_token_expire_in}`,
          },
        },
      },
    });
  }

  return { accessToken: access_token };
};

export const getSellerCredentials = async (region: string) => {
  const seller = await getSeller(region.toUpperCase());

  if (seller) {
    const { shops, connection } = seller;
    const { cipher } = shops[0];

    if (connection) {
      const oneDayFromNow = getTimeStamp() + 60 * 60 * 24 * 1;

      if (Number(connection.accessTokenExpiry) <= oneDayFromNow) {
        console.log('⏳ refreshing');
        const { accessToken } = await refreshToken(seller.id, connection.refreshToken, region);

        return { cipher, accessToken, isFallback: false };
      }

      return { cipher, accessToken: connection.accessToken, isFallback: false };
    }
  }

  // await prisma.$accelerate.invalidate({ tags: ['get_seller']})

  const cipher = process.env.FALLBACK_SHOP_CIPHER;
  const accessToken = process.env.FALLBACK_ACCESS_TOKEN;

  if (cipher && accessToken) {
    return { cipher, accessToken, isFallback: true };
  }

  return null;
};
