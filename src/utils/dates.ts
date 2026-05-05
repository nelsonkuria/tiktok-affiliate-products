const lookup = { '7d': 7 };

export function isWithinDays(target: '7d', date: Date) {
  const days = lookup[target];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return date >= sevenDaysAgo && date <= now;
}
