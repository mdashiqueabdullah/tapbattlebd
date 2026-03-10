import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Gift, Check, Info, Lock, Calendar } from "lucide-react";

function getRewardForDate(dateNum: number): number {
  return 2 + dateNum;
}

function getBDTNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
}

function getTodayBDT(): string {
  return getBDTNow().toISOString().split("T")[0];
}

function getYesterdayBDT(): string {
  const bdt = getBDTNow();
  bdt.setDate(bdt.getDate() - 1);
  return bdt.toISOString().split("T")[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const BANGLA_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBanglaNum(n: number): string {
  return String(n).split("").map(d => BANGLA_DIGITS[parseInt(d)]).join("");
}

interface StreakData {
  current_streak: number;
  last_claimed_date: string | null;
  last_play_date: string | null;
  total_streak_points: number;
}

export default function DailyStreak({ onClaim }: { onClaim?: () => Promise<void> }) {
  const { user, refreshProfile } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState(0);

  const today = getTodayBDT();
  const yesterday = getYesterdayBDT();
  const bdtNow = getBDTNow();
  const currentYear = bdtNow.getFullYear();
  const currentMonth = bdtNow.getMonth();
  const currentDate = bdtNow.getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const monthName = BANGLA_MONTHS[currentMonth];

  // Determine which dates this month have been claimed
  // We track streak as consecutive days from the start or use last_claimed_date
  const todayReward = getRewardForDate(currentDate);
  const tomorrowDate = currentDate < daysInMonth ? currentDate + 1 : null;
  const tomorrowReward = tomorrowDate ? getRewardForDate(tomorrowDate) : null;

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("daily_streaks")
      .select("current_streak, last_claimed_date, last_play_date, total_streak_points")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Streak fetch error:", error);
      setLoading(false);
      return;
    }

    if (data) {
      // Check if last claim was in a previous month — reset streak
      if (data.last_claimed_date) {
        const lastClaimMonth = new Date(data.last_claimed_date).getMonth();
        const lastClaimYear = new Date(data.last_claimed_date).getFullYear();
        if (lastClaimMonth !== currentMonth || lastClaimYear !== currentYear) {
          // New month — reset streak
          if (data.current_streak > 0) {
            await supabase
              .from("daily_streaks")
              .update({ current_streak: 0, updated_at: new Date().toISOString() })
              .eq("user_id", user.id);
            setStreakData({ ...data, current_streak: 0 });
          } else {
            setStreakData(data);
          }
        } else if (
          data.last_claimed_date !== today &&
          data.last_claimed_date !== yesterday &&
          data.current_streak > 0
        ) {
          // Missed a day within same month — reset streak
          await supabase
            .from("daily_streaks")
            .update({ current_streak: 0, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
          setStreakData({ ...data, current_streak: 0 });
        } else {
          setStreakData(data);
        }
      } else {
        setStreakData(data);
      }
    } else {
      setStreakData(null);
    }
    setLoading(false);
  }, [user, today, yesterday, currentMonth, currentYear]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const alreadyClaimed = streakData?.last_claimed_date === today;
  const currentStreak = streakData?.current_streak ?? 0;
  const totalStreakPoints = streakData?.total_streak_points ?? 0;

  // Figure out which dates are claimed (consecutive ending at last_claimed_date)
  const claimedDates = useMemo(() => {
    if (!streakData?.last_claimed_date) return new Set<number>();
    const lastDate = new Date(streakData.last_claimed_date);
    if (lastDate.getMonth() !== currentMonth || lastDate.getFullYear() !== currentYear) return new Set<number>();
    const lastDay = lastDate.getDate();
    const streak = streakData.current_streak;
    const dates = new Set<number>();
    for (let i = 0; i < streak; i++) {
      dates.add(lastDay - i);
    }
    return dates;
  }, [streakData, currentMonth, currentYear]);

  const handleClaim = async () => {
    if (!user || claiming || alreadyClaimed) return;
    setClaiming(true);

    const newStreak = currentStreak + 1;
    const reward = getRewardForDate(currentDate);

    try {
      if (!streakData) {
        const { error } = await supabase.from("daily_streaks").insert({
          user_id: user.id,
          current_streak: newStreak,
          last_claimed_date: today,
          last_play_date: today,
          total_streak_points: reward,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_streaks")
          .update({
            current_streak: newStreak,
            last_claimed_date: today,
            last_play_date: today,
            total_streak_points: (streakData.total_streak_points || 0) + reward,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        if (error) throw error;
      }

      setClaimedReward(reward);
      setJustClaimed(true);
      await fetchStreak();
      await refreshProfile();

      setTimeout(() => setJustClaimed(false), 3000);
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-20 rounded bg-muted/30" />
      </div>
    );
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  // Grid columns: 7 per row (like a calendar week)
  const gridCols = 7;

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" />
          <h3 className="font-display text-base font-bold text-foreground">মাসিক ক্লেইম</h3>
        </div>
        <div className="flex items-center gap-1.5 glass-card px-3 py-1 rounded-full">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-bold text-accent">{monthName} — {toBanglaNum(currentStreak)} দিন স্ট্রিক</span>
        </div>
      </div>

      {/* Claim section */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/30 border border-border/30">
        <div>
          <p className="text-[11px] text-muted-foreground">আজকের তারিখ: {toBanglaNum(currentDate)} {monthName}</p>
          <p className="font-display text-lg font-bold text-primary">
            আজকের বোনাস: +{alreadyClaimed ? claimedReward || todayReward : todayReward}
          </p>
          {!alreadyClaimed && tomorrowReward && (
            <p className="text-[10px] text-muted-foreground mt-0.5">আগামীকালের বোনাস: +{tomorrowReward}</p>
          )}
        </div>

        {alreadyClaimed ? (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/20 text-accent text-sm font-semibold flex-shrink-0">
            <Check className="w-4 h-4" />
            ক্লেইম করা হয়েছে
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm neon-border disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
          >
            <Gift className="w-4 h-4" />
            {claiming ? "..." : "ক্লেইম করুন"}
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day) => {
          const reward = getRewardForDate(day);
          const isClaimed = claimedDates.has(day);
          const isToday = day === currentDate;
          const isPast = day < currentDate && !isClaimed;
          const isFuture = day > currentDate;

          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-center border transition-colors ${
                isClaimed
                  ? "bg-accent/20 border-accent/30"
                  : isToday && !alreadyClaimed
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                  : isToday && alreadyClaimed
                  ? "bg-accent/20 border-accent/30"
                  : isPast
                  ? "bg-destructive/5 border-border/10"
                  : "bg-muted/10 border-border/15"
              }`}
            >
              <span className={`text-[9px] font-bold leading-tight ${
                isClaimed || (isToday && alreadyClaimed) ? "text-accent" : isToday ? "text-primary" : isPast ? "text-muted-foreground/40" : "text-muted-foreground/50"
              }`}>
                {toBanglaNum(day)}
              </span>
              {isClaimed || (isToday && alreadyClaimed) ? (
                <Check className="w-2.5 h-2.5 text-accent" />
              ) : isToday ? (
                <Gift className="w-2.5 h-2.5 text-primary" />
              ) : isFuture ? (
                <Lock className="w-2 h-2 text-muted-foreground/25" />
              ) : (
                <span className="text-[7px] text-destructive/40">✕</span>
              )}
              <span className={`text-[7px] font-bold leading-none ${
                isClaimed || (isToday && alreadyClaimed) ? "text-accent/70" : isToday ? "text-primary/70" : "text-muted-foreground/30"
              }`}>
                +{reward}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total streak info */}
      <div className="flex items-center gap-1.5 px-1">
        <Info className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          মোট স্ট্রিক পয়েন্ট: <span className="font-bold text-accent">{totalStreakPoints}</span> — লিডারবোর্ডে যোগ হয়
        </p>
      </div>

      {/* Just claimed animation */}
      <AnimatePresence>
        {justClaimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-4xl mb-2"
              >
                🎉
              </motion.div>
              <p className="font-display text-xl font-bold text-accent">+{claimedReward} পয়েন্ট!</p>
              <p className="text-xs text-muted-foreground mt-1">লিডারবোর্ড স্কোরে যোগ হয়েছে</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
