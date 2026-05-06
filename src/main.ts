import { Actor } from 'apify';

import { findTarget } from './api/helpers.js';
import { getAffiliateProduct } from './routes/products.js';

await Actor.init();

interface Input {
  endpoint: string;
  params: Record<string, string | number>;
}

const input = await Actor.getInput<Input>();
if (!input) throw new Error('Please provide correct inputs.');

const { endpoint, params } = input;
const target = await findTarget(endpoint);

if (target === '/products') {
  const result = await getAffiliateProduct(params);
  const { code, status, event, messages, data } = result;
  const payload = { code, status, ...(messages ? { messages } : {}), data };

  await Actor.charge({ eventName: event.name, count: 1 });

  await Actor.pushData(payload);
}

await Actor.exit();
