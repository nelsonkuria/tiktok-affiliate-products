import { createHmac } from 'node:crypto';

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

const getQueryParams = (request: Request | string) => {
  const route = request instanceof Request ? request.url : request;
  const url = new URL(route);
  return Object.fromEntries(url.searchParams.entries());
};

export async function generateSign(
  url: string,
  region: string,
  isFormData?: boolean,
  requestBody?: Record<string, unknown>,
) {
  const { appSecret } = getRegionCredentials(region);
  const excludeKeys = ['sign'] as string[];

  /**
   * To generate the signature, we'll create the string to sign then encode it using hmac-sha256
   * This will happen in a number of steps
   * 1. We'll extract all query params excluding `sign` and reorder the param keys alphabetically
   * 2. Concatenate the query params in the format {key}{value}
   * 3. We will then append the resulting string to the API request path
   * 4. If content-type is application/json, we'll append the API request body to the sign string
   * 5. Wrap the string with the app secret
   * 6. Encode it with hmac-sha256
   */

  let signString = '';

  const params = getQueryParams(url) || {};
  const sortedParams = Object.keys(params)
    .filter((key) => !excludeKeys.includes(key))
    .sort()
    .map((key) => ({ key, value: params[key] }));

  const paramString = sortedParams.map(({ key, value }) => `${key}${value}`).join('');

  const { pathname } = new URL(url);
  signString = `${pathname}${paramString}`;

  if (!isFormData) {
    if (requestBody && Object.keys(requestBody).length) {
      const body = JSON.stringify(requestBody);
      signString += body;
    }
  }

  signString = `${appSecret}${signString}${appSecret}`;

  const hmac = createHmac('sha256', appSecret).update(signString);

  return hmac.digest('hex');
}
