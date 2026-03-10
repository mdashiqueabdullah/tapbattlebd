export const PRIZE_DISTRIBUTION: { rankRange: string; amount: number; count: number }[] = [
  { rankRange: "১ম", amount: 3000, count: 1 },
  { rankRange: "২য়", amount: 2000, count: 1 },
  { rankRange: "৩য়", amount: 1000, count: 1 },
  { rankRange: "৪র্থ–১০ম", amount: 500, count: 7 },
  { rankRange: "১১–৫০", amount: 150, count: 40 },
  { rankRange: "৫১–১০০", amount: 50, count: 50 },
];

export const TOTAL_PRIZE = 15000;
export const MAX_RANKED_ATTEMPTS = 10;
export const GAME_DURATION_SECONDS = 30;
export const GOLDEN_TARGET_CHANCE = 0.15;
export const GOLDEN_TARGET_POINTS = 3;
export const NORMAL_TARGET_POINTS = 1;
export const TARGET_DISPLAY_MS = 1200;

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`;
}
