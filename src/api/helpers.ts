import type { TargetTypes } from '../types/TikTok.js';
import { targetTypes } from '../types/TikTok.js';

export async function findTarget(endpoint: string) {
  const url = new URL(endpoint, 'https://api.apify.com');
  const segments = url.pathname.split('/').filter(Boolean);
  const target = `/${segments.join('/')}`;

  return isValidTarget(target) ? target : '/error';
}

export function isValidTarget(value: string): value is TargetTypes {
  return targetTypes.includes(value as TargetTypes);
}
