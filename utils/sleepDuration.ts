/**
 * Calculates the duration between bedtime and wake-up time.
 * Handles midnight rollover.
 */
export const calculateSleepDuration = (
  bedtime: { hour: number; minute: number },
  wakeUp: { hour: number; minute: number }
): { hours: number; minutes: number } => {
  const start = bedtime.hour + bedtime.minute / 60;
  const end = wakeUp.hour + wakeUp.minute / 60;

  let diff = end - start;
  if (diff < 0) {
    diff += 24;
  }

  const hours = Math.floor(diff);
  const minutes = Math.round((diff - hours) * 60);

  return { hours, minutes };
};

export const formatDuration = (hours: number, minutes: number): string => {
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
};
