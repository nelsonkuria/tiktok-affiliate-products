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
  const { status, event, messages, data } = result;
  const payload = { status, ...(messages ? { messages } : {}), data };

  await Actor.charge({ eventName: event.name, count: 1 });

  await Actor.pushData(payload);
}

if (target) {
  const payload = {
    status: 'error',
    messages: [
      'Unsupported endpoint.',
      'You might have a typo in your endpoint or you entered an unsupported endpoint. Please check the reference.',
    ],
    data: null,
  };

  await Actor.pushData(payload);
}

await Actor.exit();
