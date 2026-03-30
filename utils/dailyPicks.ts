/**
 * Returns a deterministic pick from an array of items based on the current date.
 * This ensures the same item is selected throughout the day and across different screens.
 */
export function getDailyPick<T>(items: T[]): T {
  if (!items || items.length === 0) return null as T;

  // Use the current date string (YYYY-MM-DD) as a seed
  const today = new Date().toISOString().split('T')[0];
  
  // Simple hash function to convert date string to a number
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    const char = today.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the absolute hash to pick an index
  const index = Math.abs(hash) % items.length;
  return items[index];
}
