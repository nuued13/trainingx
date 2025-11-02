export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

export function updateStreak(lastActiveDate: string | null, todayDate: Date): number {
  if (!lastActiveDate) return 1;

  const lastDate = new Date(lastActiveDate);
  const diff = daysBetween(lastDate, todayDate);

  if (diff === 1) {
    return 1;
  } else if (diff > 1) {
    return 1;
  }

  return 0;
}
