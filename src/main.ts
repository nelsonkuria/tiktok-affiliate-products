import { Actor } from 'apify';

import { findTarget } from './api/helpers.js';
import { getAffiliateProduct } from './routes/products.js';
import { seedProducts } from './utils/products.js';

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
  await getAffiliateProduct(params);
}

console.log('Seeding products..');
await seedProducts();

const creator = {};

if (creator) {
  // console.log('creator', creator);
  await Actor.pushData(creator);
}

await Actor.exit();
