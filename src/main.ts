import { Actor } from 'apify';

await Actor.init();

interface Input {
  resource: string;
  region?: string;
}

const input = await Actor.getInput<Input>();
if (!input) throw new Error('Please provide a resource');

const { resource, region } = input;
console.log('input', { resource, region });

console.log('Initialised apify starter.');

const creator = {};

if (creator) {
  // console.log('creator', creator);
  await Actor.pushData(creator);
}

await Actor.exit();
