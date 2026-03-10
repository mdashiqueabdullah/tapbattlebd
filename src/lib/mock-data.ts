export const mockLeaderboard = [
  { rank: 1, username: "TapKing_BD", bestScore: 87, attemptsUsed: 3, prize: 3000 },
  { rank: 2, username: "SpeedTapper", bestScore: 84, attemptsUsed: 5, prize: 2000 },
  { rank: 3, username: "RajuGamer", bestScore: 82, attemptsUsed: 4, prize: 1000 },
  { rank: 4, username: "NeonFingers", bestScore: 80, attemptsUsed: 6, prize: 500 },
  { rank: 5, username: "ClickMaster", bestScore: 79, attemptsUsed: 2, prize: 500 },
  { rank: 6, username: "BDFlash", bestScore: 78, attemptsUsed: 7, prize: 500 },
  { rank: 7, username: "TapStar22", bestScore: 77, attemptsUsed: 4, prize: 500 },
  { rank: 8, username: "QuickHand", bestScore: 76, attemptsUsed: 5, prize: 500 },
  { rank: 9, username: "ProTapper", bestScore: 75, attemptsUsed: 3, prize: 500 },
  { rank: 10, username: "GameBoss", bestScore: 74, attemptsUsed: 8, prize: 500 },
  { rank: 11, username: "FastFinger", bestScore: 73, attemptsUsed: 4, prize: 150 },
  { rank: 12, username: "TapNinja", bestScore: 72, attemptsUsed: 6, prize: 150 },
  { rank: 13, username: "PixelTap", bestScore: 71, attemptsUsed: 5, prize: 150 },
  { rank: 14, username: "LightSpeed", bestScore: 70, attemptsUsed: 3, prize: 150 },
  { rank: 15, username: "BDChamp", bestScore: 69, attemptsUsed: 7, prize: 150 },
];

export const mockPastWinners = [
  { week: "সপ্তাহ ৪", rank: 1, username: "TapKing_BD", prize: 3000, status: "paid" as const },
  { week: "সপ্তাহ ৪", rank: 2, username: "SpeedTapper", prize: 2000, status: "paid" as const },
  { week: "সপ্তাহ ৪", rank: 3, username: "RajuGamer", prize: 1000, status: "approved" as const },
  { week: "সপ্তাহ ৩", rank: 1, username: "ProTapper", prize: 3000, status: "paid" as const },
  { week: "সপ্তাহ ৩", rank: 2, username: "NeonFingers", prize: 2000, status: "paid" as const },
];

export function getMockCountdown() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return { days: daysUntilSunday, hours: 23 - now.getUTCHours(), minutes: 59 - now.getUTCMinutes() };
}
