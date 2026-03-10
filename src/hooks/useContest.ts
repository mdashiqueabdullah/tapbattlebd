import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Contest {
  id: string;
  month: number;
  year: number;
  start_at: string;
  end_at: string;
  prize_pool: number;
  status: string;
}

interface LeaderboardEntry {
  user_id: string;
  contest_id: string;
  attempt_total_score: number;
  referral_points: number;
  daily_streak_points: number;
  total_score: number;
  attempts_used: number;
  rank_position: number | null;
  username?: string;
}

interface UserContestData {
  contest: Contest | null;
  attemptsUsed: number;
  maxAttempts: number;
  attemptTotalScore: number;
  referralPoints: number;
  streakPoints: number;
  totalScore: number;
  currentRank: number | null;
  loading: boolean;
}

export function useContest(): UserContestData & {
  refreshContest: () => Promise<void>;
  leaderboard: LeaderboardEntry[];
  loadLeaderboard: () => Promise<void>;
} {
  const { user, profile } = useAuth();
  const [contest, setContest] = useState<Contest | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptTotalScore, setAttemptTotalScore] = useState(0);
  const [streakPoints, setStreakPoints] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const extraAttempts = (profile as any)?.extra_attempts ?? 0;
  const bonusAttempts = (profile as any)?.bonus_attempts ?? 0;
  const maxAttempts = 10 + extraAttempts + bonusAttempts;
  const referralPoints = profile?.referral_points ?? 0;

  const fetchContest = useCallback(async () => {
    // Get current contest
    const now = new Date();
    const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
    const month = bdtNow.getMonth() + 1;
    const year = bdtNow.getFullYear();

    const { data: contestData } = await supabase
      .from("monthly_contests")
      .select("*")
      .eq("month", month)
      .eq("year", year)
      .single();

    if (contestData) {
      setContest(contestData as unknown as Contest);
      return contestData.id;
    }

    // If no contest exists, call the RPC to create one
    const { data: contestId } = await supabase.rpc("get_or_create_current_contest");
    if (contestId) {
      const { data: newContest } = await supabase
        .from("monthly_contests")
        .select("*")
        .eq("id", contestId)
        .single();
      if (newContest) {
        setContest(newContest as unknown as Contest);
        return newContest.id;
      }
    }
    return null;
  }, []);

  const refreshContest = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const contestId = await fetchContest();
    if (!contestId) { setLoading(false); return; }

    // Get user's leaderboard entry
    const { data: lbEntry } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("user_id", user.id)
      .eq("contest_id", contestId)
      .maybeSingle();

    if (lbEntry) {
      setAttemptsUsed((lbEntry as any).attempts_used ?? 0);
      setAttemptTotalScore((lbEntry as any).attempt_total_score ?? 0);
      setStreakPoints((lbEntry as any).daily_streak_points ?? 0);
      setTotalScore((lbEntry as any).total_score ?? 0);
    } else {
      setAttemptsUsed(0);
      setAttemptTotalScore(0);
      setStreakPoints(0);
      setTotalScore(0);
    }

    // Get rank
    if (lbEntry) {
      const { count } = await supabase
        .from("leaderboard")
        .select("*", { count: "exact", head: true })
        .eq("contest_id", contestId)
        .gt("total_score", (lbEntry as any).total_score ?? 0);
      setCurrentRank((count ?? 0) + 1);
    } else {
      setCurrentRank(null);
    }

    setLoading(false);
  }, [user, fetchContest]);

  const loadLeaderboard = useCallback(async () => {
    if (!contest) {
      await fetchContest();
    }
    const cid = contest?.id;
    if (!cid) return;

    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("contest_id", cid)
      .order("total_score", { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      // Fetch usernames
      const userIds = data.map((e: any) => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username]));
      
      setLeaderboard(data.map((e: any, i: number) => ({
        ...e,
        username: nameMap.get(e.user_id) || "Unknown",
        rank_position: i + 1,
      })));
    } else {
      setLeaderboard([]);
    }
  }, [contest, fetchContest]);

  useEffect(() => {
    if (user) refreshContest();
    else {
      // Still load contest for non-logged-in users
      fetchContest().then(() => setLoading(false));
    }
  }, [user, refreshContest, fetchContest]);

  return {
    contest,
    attemptsUsed,
    maxAttempts,
    attemptTotalScore,
    referralPoints,
    streakPoints,
    totalScore,
    currentRank,
    loading,
    refreshContest,
    leaderboard,
    loadLeaderboard,
  };
}
