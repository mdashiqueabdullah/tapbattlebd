import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Gift, Check, Info, Lock } from "lucide-react";

function getRewardForDay(day: number): number {
  return 2 + day;
}

function getTodayBDT(): string {
  const now = new Date();
  const bdt = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
  return bdt.toISOString().split("T")[0];
}

function getYesterdayBDT(): string {
  const now = new Date();
  const bdt = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
  bdt.setDate(bdt.getDate() - 1);
  return bdt.toISOString().split("T")[0];
}

interface StreakData {
  current_streak: number;
  last_claimed_date: string | null;
  last_play_date: string | null;
  total_streak_points: number;
}

export default function DailyStreak() {
  const { user, profile, refreshProfile } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState(0);

  const today = getTodayBDT();
  const yesterday = getYesterdayBDT();

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
      if (
        data.last_claimed_date &&
        data.last_claimed_date !== today &&
        data.last_claimed_date !== yesterday &&
        data.current_streak > 0
      ) {
        await supabase
          .from("daily_streaks")
          .update({ current_streak: 0, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        setStreakData({ ...data, current_streak: 0 });
      } else {
        setStreakData(data);
      }
    } else {
      setStreakData(null);
    }
    setLoading(false);
  }, [user, today, yesterday]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const alreadyClaimed = streakData?.last_claimed_date === today;
  const currentStreak = streakData?.current_streak ?? 0;
  const totalStreakPoints = streakData?.total_streak_points ?? 0;
  const nextDay = currentStreak + 1;
  const todayReward = getRewardForDay(nextDay);
  const nextReward = getRewardForDay(Math.min(nextDay + 1, 30));

  const handleClaim = async () => {
    if (!user || claiming || alreadyClaimed) return;
    setClaiming(true);

    const newStreak = Math.min(currentStreak + 1, 30);
    const reward = getRewardForDay(newStreak);

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

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" />
          <h3 className="font-display text-base font-bold text-foreground">দৈনিক স্ট্রিক</h3>
        </div>
        <div className="glass-card px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-accent">{currentStreak}/৩০ দিন</span>
        </div>
      </div>

      {/* Claim section */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/30 border border-border/30">
        <div>
          <p className="text-xs text-muted-foreground">আজকের বোনাস</p>
          <p className="font-display text-lg font-bold text-primary">
            +{alreadyClaimed ? claimedReward || getRewardForDay(currentStreak) : todayReward} পয়েন্ট
          </p>
          {!alreadyClaimed && nextDay < 30 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">পরের দিন: +{nextReward} পয়েন্ট</p>
          )}
        </div>

        {alreadyClaimed ? (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/20 text-accent text-sm font-semibold">
            <Check className="w-4 h-4" />
            ক্লেইম করা হয়েছে
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm neon-border disabled:opacity-50 flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4" />
            {claiming ? "..." : "ক্লেইম করুন"}
          </button>
        )}
      </div>

      {/* 30-day grid */}
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {days.map((day) => {
          const reward = getRewardForDay(day);
          const isCompleted = currentStreak >= day;
          const isCurrent = !alreadyClaimed && nextDay === day;
          const isLocked = day > currentStreak + 1 || (alreadyClaimed && day > currentStreak);

          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-center border transition-colors ${
                isCompleted
                  ? "bg-accent/20 border-accent/30"
                  : isCurrent
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                  : "bg-muted/10 border-border/20"
              }`}
            >
              <span className="text-[8px] text-muted-foreground leading-none">Day</span>
              <span className={`text-[10px] font-bold leading-tight ${isCompleted ? "text-accent" : isCurrent ? "text-primary" : "text-muted-foreground/60"}`}>
                {day}
              </span>
              {isCompleted ? (
                <Check className="w-3 h-3 text-accent" />
              ) : isCurrent ? (
                <Gift className="w-3 h-3 text-primary" />
              ) : (
                <Lock className="w-2.5 h-2.5 text-muted-foreground/30" />
              )}
              <span className={`text-[8px] font-bold leading-none ${isCompleted ? "text-accent" : isCurrent ? "text-primary" : "text-muted-foreground/40"}`}>
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
