import { Actor } from 'apify';

import { seedProducts } from './utils/seeder.js';

await Actor.init();

interface Input {
  resource: string;
  region?: string;
}

const input = await Actor.getInput<Input>();
if (!input) throw new Error('Please provide a resource');

const { resource, region } = input;
console.log('input', { resource, region });

console.log('Seeding products..');
await seedProducts();

const creator = {};

if (creator) {
  // console.log('creator', creator);
  await Actor.pushData(creator);
}

await Actor.exit();
