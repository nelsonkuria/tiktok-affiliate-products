import type { BaseAPIResponse } from '~/types/TikTok.js';

import { generateSign, getRegionCredentials, getTimeStamp } from './tiktok.js';

interface FetchQuery {
  shop_cipher?: string;
  [key: string]: string | undefined;
}

export async function ttsFetch(
  method: string,
  endpoint: string,
  isFormData: boolean,
  token: string,
  region: string,
  body?: any,
  query?: FetchQuery | null,
) {
  const { appKey } = getRegionCredentials(region);
  const timestamp = getTimeStamp();

  const url = `https://open-api.tiktokglobalshop.com${endpoint}?${new URLSearchParams({
    app_key: appKey,
    timestamp: `${timestamp}`,
    ...(query || {}),
  })}`;

  const sign = await generateSign(url, region, isFormData, body);

  const headers: { [key: string]: any } = {
    'x-tts-access-token': token,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${url}&sign=${sign}`, {
    headers,
    ...(!body
      ? {}
      : {
          method,
          body: isFormData ? body : JSON.stringify(body),
        }),
  });

  if (!response.ok) {
    // log this error somewhere on the server
    // const error = 'TTS Fetch Error';
    const result = (await response.json()) as BaseAPIResponse;

    // console.log('result', result);

    // const { message } = result;
    // const details = {
    //   status: `${response.status} ${response.statusText}`,
    //   message,
    //   endpoint,
    // };
    // console.info(`${error} \n`);
    // console.dir(details, { depth: null, colors: true });

    if (result.code === 105002) {
      console.error('Request failed.');
      console.dir({ status: 500, message: 'internal server error' });
      throw new Error('This error usually resolves after sometime. Please try again later.');
    } else return { ...result, message: 'Fetch error', request_id: 'billy-jean' };
  }

  return response.json();
}
