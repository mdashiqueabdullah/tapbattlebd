export const mockLeaderboard = [
  { rank: 1, username: "TapKing_BD", attemptTotal: 245, referralPoints: 60, streakPoints: 35, totalScore: 340, attemptsUsed: 8, prize: 3000 },
  { rank: 2, username: "SpeedTapper", attemptTotal: 210, referralPoints: 40, streakPoints: 50, totalScore: 300, attemptsUsed: 10, prize: 2000 },
  { rank: 3, username: "RajuGamer", attemptTotal: 198, referralPoints: 20, streakPoints: 25, totalScore: 243, attemptsUsed: 7, prize: 1000 },
  { rank: 4, username: "NeonFingers", attemptTotal: 185, referralPoints: 20, streakPoints: 15, totalScore: 220, attemptsUsed: 9, prize: 500 },
  { rank: 5, username: "ClickMaster", attemptTotal: 175, referralPoints: 0, streakPoints: 30, totalScore: 205, attemptsUsed: 6, prize: 500 },
  { rank: 6, username: "BDFlash", attemptTotal: 168, referralPoints: 0, streakPoints: 20, totalScore: 188, attemptsUsed: 10, prize: 500 },
  { rank: 7, username: "TapStar22", attemptTotal: 160, referralPoints: 0, streakPoints: 15, totalScore: 175, attemptsUsed: 8, prize: 500 },
  { rank: 8, username: "QuickHand", attemptTotal: 155, referralPoints: 0, streakPoints: 10, totalScore: 165, attemptsUsed: 7, prize: 500 },
  { rank: 9, username: "ProTapper", attemptTotal: 150, referralPoints: 0, streakPoints: 5, totalScore: 155, attemptsUsed: 5, prize: 500 },
  { rank: 10, username: "GameBoss", attemptTotal: 140, referralPoints: 0, streakPoints: 10, totalScore: 150, attemptsUsed: 10, prize: 500 },
  { rank: 11, username: "FastFinger", attemptTotal: 135, referralPoints: 0, streakPoints: 5, totalScore: 140, attemptsUsed: 9, prize: 150 },
  { rank: 12, username: "TapNinja", attemptTotal: 130, referralPoints: 0, streakPoints: 5, totalScore: 135, attemptsUsed: 8, prize: 150 },
  { rank: 13, username: "PixelTap", attemptTotal: 125, referralPoints: 0, streakPoints: 5, totalScore: 130, attemptsUsed: 7, prize: 150 },
  { rank: 14, username: "LightSpeed", attemptTotal: 120, referralPoints: 0, streakPoints: 5, totalScore: 125, attemptsUsed: 6, prize: 150 },
  { rank: 15, username: "BDChamp", attemptTotal: 115, referralPoints: 0, streakPoints: 5, totalScore: 120, attemptsUsed: 10, prize: 150 },
];

export const mockAttemptHistory = [
  { attempt: 1, score: 30, date: "২০২৬-০৩-০২ ১০:১৫" },
  { attempt: 2, score: 25, date: "২০২৬-০৩-০৩ ১৪:৩০" },
  { attempt: 3, score: 40, date: "২০২৬-০৩-০৫ ০৯:৪৫" },
];

export const mockPastWinners = [
  { month: "ফেব্রুয়ারি ২০২৬", rank: 1, username: "TapKing_BD", prize: 3000, status: "paid" as const },
  { month: "ফেব্রুয়ারি ২০২৬", rank: 2, username: "SpeedTapper", prize: 2000, status: "paid" as const },
  { month: "ফেব্রুয়ারি ২০২৬", rank: 3, username: "RajuGamer", prize: 1000, status: "approved" as const },
  { month: "জানুয়ারি ২০২৬", rank: 1, username: "ProTapper", prize: 3000, status: "paid" as const },
  { month: "জানুয়ারি ২০২৬", rank: 2, username: "NeonFingers", prize: 2000, status: "paid" as const },
];

export function getMockCountdown() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - now.getDate();
  return { days: daysLeft, hours: 23 - now.getUTCHours(), minutes: 59 - now.getUTCMinutes() };
}
