import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { PRIZE_DISTRIBUTION } from "@/lib/prizes";

interface LeaderboardEntry {
  rank: number;
  username: string;
  attemptTotal: number;
  referralPoints: number;
  streakPoints: number;
  totalScore: number;
  prize: number;
  userId: string;
}

function getPrize(rank: number): number {
  if (rank === 1) return 3000;
  if (rank === 2) return 2000;
  if (rank === 3) return 1000;
  if (rank >= 4 && rank <= 10) return 500;
  if (rank >= 11 && rank <= 50) return 150;
  if (rank >= 51 && rank <= 100) return 50;
  return 0;
}

const PAGE_SIZE = 20;

export default function Leaderboard() {
  const [tab, setTab] = useState("current");
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const tabs = [
    { key: "current", label: "চলতি মাস" },
    { key: "mine", label: "আমার র‍্যাঙ্কিং" },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1); }, [tab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const now = new Date();
    const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
    const month = bdtNow.getMonth() + 1;
    const year = bdtNow.getFullYear();

    const { data: contestData } = await supabase
      .from("monthly_contests")
      .select("id")
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (!contestData) {
      await supabase.rpc("get_or_create_current_contest");
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("contest_id", contestData.id)
      .order("total_score", { ascending: false })
      .limit(1000);

    if (data && data.length > 0) {
      const userIds = data.map((e: any) => e.user_id);
      // Fetch profiles in batches if needed
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username]));

      const mapped: LeaderboardEntry[] = data.map((e: any, i: number) => ({
        rank: i + 1,
        username: nameMap.get(e.user_id) || "Unknown",
        attemptTotal: e.attempt_total_score ?? 0,
        referralPoints: e.referral_points ?? 0,
        streakPoints: e.daily_streak_points ?? 0,
        totalScore: e.total_score ?? 0,
        prize: getPrize(i + 1),
        userId: e.user_id,
      }));
      setAllEntries(mapped);

      if (user) {
        const mine = mapped.find(e => e.userId === user.id);
        setMyEntry(mine || null);
      }
    } else {
      setAllEntries([]);
    }
    setLoading(false);
  };

  const displayEntries = tab === "mine" && myEntry ? [myEntry] : allEntries;
  const totalPages = Math.ceil(displayEntries.length / PAGE_SIZE);
  const paginatedEntries = tab === "mine" 
    ? displayEntries 
    : displayEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <BannerAd className="mb-4" />

          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">মাসিক লিডারবোর্ড</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("contestEnds")}: <CountdownTimer compact /></p>
          <p className="text-[11px] text-muted-foreground mb-4">মোট স্কোর = অ্যাটেম্পট + রেফার + স্ট্রিক</p>

          <div className="flex gap-1 mb-4 p-1 glass-card rounded-lg">
            {tabs.map(tb => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === tb.key ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
          ) : displayEntries.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="text-muted-foreground">
                {tab === "mine" ? "আপনি এখনো কোনো অ্যাটেম্পট দেননি" : "এখনো কোনো ডেটা নেই"}
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              {tab === "current" && currentPage === 1 && allEntries.length >= 3 && (
                <div className="flex justify-center items-end gap-2 sm:gap-3 mb-6 px-2">
                  {[1, 0, 2].map(idx => {
                    const entry = allEntries[idx];
                    if (!entry) return null;
                    const isFirst = idx === 0;
                    return (
                      <div key={idx} className={`text-center ${isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                        <div className={`glass-card ${isFirst ? "neon-border-gold p-4 sm:p-5" : "p-3 sm:p-4"} rounded-2xl`}>
                          <span className="text-xl sm:text-2xl">{["🥇", "🥈", "🥉"][idx]}</span>
                          <p className={`font-bold ${isFirst ? "text-base sm:text-lg" : "text-xs sm:text-sm"} text-foreground mt-1 truncate max-w-[80px] sm:max-w-[100px]`}>{entry.username}</p>
                          <p className={`font-display font-bold ${isFirst ? "text-xl sm:text-2xl text-accent neon-text-gold" : "text-base sm:text-lg text-primary"}`}>{entry.totalScore}</p>
                          <div className="flex flex-wrap justify-center gap-x-2 mt-1">
                            {entry.referralPoints > 0 && <span className="text-[10px] text-neon-pink">+{entry.referralPoints} রেফার</span>}
                            {entry.streakPoints > 0 && <span className="text-[10px] text-accent">+{entry.streakPoints} স্ট্রিক</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">৳{entry.prize?.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List */}
              <div className="glass-card divide-y divide-border/20 overflow-hidden rounded-xl">
                <div className="flex items-center px-3 py-2 text-[10px] text-muted-foreground font-medium bg-muted/30">
                  <span className="w-8">#</span>
                  <span className="flex-1">{t("username")}</span>
                  <span className="w-12 text-right">অ্যাটেম্পট</span>
                  <span className="w-10 text-right">রেফার</span>
                  <span className="w-10 text-right">স্ট্রিক</span>
                  <span className="w-12 text-right">মোট</span>
                </div>
                {paginatedEntries.map(entry => (
                  <div key={entry.rank} className={`flex items-center px-3 py-3 ${entry.rank <= 3 ? "bg-accent/5" : ""} ${entry.userId === user?.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                    <span className={`w-8 font-display font-bold text-sm ${entry.rank <= 3 ? "text-accent" : "text-muted-foreground"}`}>
                      {entry.rank}
                    </span>
                    <span className="flex-1 font-medium text-foreground text-sm truncate pr-1">{entry.username}</span>
                    <span className="w-12 text-right text-muted-foreground text-xs">{entry.attemptTotal}</span>
                    <span className="w-10 text-right text-neon-pink text-xs">{entry.referralPoints}</span>
                    <span className="w-10 text-right text-accent text-xs">{entry.streakPoints}</span>
                    <span className="w-12 text-right font-display font-bold text-primary text-sm">{entry.totalScore}</span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {tab === "current" && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 glass-card rounded-xl px-4 py-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 text-sm font-medium text-foreground disabled:text-muted-foreground/40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> আগের
                  </button>
                  <span className="text-sm text-muted-foreground">
                    পৃষ্ঠা {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 text-sm font-medium text-foreground disabled:text-muted-foreground/40 transition-colors"
                  >
                    পরের <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          <RectangleAd className="mt-4" />
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">টপ ১০০ জন পুরস্কার পায় • র‍্যাঙ্কিং প্রতি মিনিটে আপডেট হয়</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}