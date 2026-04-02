// ─── SHEEP GROWTH CONSTANTS ──────────────────────────────────────────────────
// To adjust point thresholds, edit the `pointsRequired` values below.

export const SHEEP_STAGES = [
  { id: 1, name: 'Tiny Lamb',     pointsRequired: 0   },
  { id: 2, name: 'Small Lamb',    pointsRequired: 7   },
  { id: 3, name: 'Young Sheep',   pointsRequired: 21  },
  { id: 4, name: 'Adult Sheep',   pointsRequired: 45  },
  { id: 5, name: 'Fluffy Elder',  pointsRequired: 80  },
  { id: 6, name: 'Golden Sheep',  pointsRequired: 130 },
] as const;

// Recharge duration for pet / feed actions (12 hours in ms)
export const RECHARGE_DURATION_MS = 12 * 60 * 60 * 1000;

// Point values per action
export const POINTS_DAILY_RATING = 1;
export const POINTS_STREAK_DAY   = 2;
export const POINTS_PET          = 1;
export const POINTS_FEED         = 1;

// Legend colors for progress bar breakdown
export const POINT_COLORS = {
  daily:  '#8B6DAE', // accent / purple
  feed:   '#6B9A60', // green
  pet:    '#5A8AB0', // blue
  streak: '#E8C88A', // warm gold
};
