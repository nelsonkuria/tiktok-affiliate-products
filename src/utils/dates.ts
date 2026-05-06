const lookup = { '1d': 1, '7d': 7 };

export function isWithinDays(target: '1d' | '7d', date: Date) {
  const days = lookup[target];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return date >= sevenDaysAgo && date <= now;
}

export const startOfUTCDay = (date: Date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const isInLosAngelesHourRange = (
  startHour: number,
  endHour: number,
  date = new Date(),
) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    hour12: false,
  });

  const hour = Number(formatter.format(date));

  return hour >= startHour && hour < endHour;
};
