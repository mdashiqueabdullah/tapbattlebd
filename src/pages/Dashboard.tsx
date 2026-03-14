import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TapGame from "@/components/TapGame";
import ReferralSection from "@/components/ReferralSection";
import PurchaseHistory from "@/components/PurchaseHistory";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { useAuth } from "@/hooks/useAuth";
import { useContest } from "@/hooks/useContest";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { Gamepad2, Trophy, Award, Target, BarChart3, User, CreditCard, Users, Gift, Flame, ListOrdered, LogOut } from "lucide-react";
import DailyStreak from "@/components/DailyStreak";

interface AttemptRecord {
  id: string;
  attempt_number: number;
  score: number;
  created_at: string;
}

export default function Dashboard() {
  const [gameMode, setGameMode] = useState<"none" | "ranked" | "practice">("none");
  const [activeTab, setActiveTab] = useState<"main" | "referral">("main");
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([]);
  const { profile, refreshProfile, signOut, user } = useAuth();
  const { attemptsUsed, attemptTotalScore, referralPoints, streakPoints, totalScore, currentRank, refreshContest, contest } = useContest();
  const navigate = useNavigate();

  // Fetch attempt history
  useEffect(() => {
    if (!user || !contest) return;
    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id, attempt_number, score, created_at")
        .eq("user_id", user.id)
        .eq("contest_id", contest.id)
        .order("attempt_number", { ascending: true });
      setAttemptHistory((data as AttemptRecord[]) || []);
    })();
  }, [user, contest]);

  if (gameMode !== "none") {
    return (
      <TapGame
        isPractice={gameMode === "practice"}
        onGameEnd={async (score) => {
          setGameMode("none");
          await refreshContest();
          await refreshProfile();
          if (user && contest) {
            const { data } = await supabase
              .from("attempts")
              .select("id, attempt_number, score, created_at")
              .eq("user_id", user.id)
              .eq("contest_id", contest.id)
              .order("attempt_number", { ascending: true });
            setAttemptHistory((data as AttemptRecord[]) || []);
          }
        }}
        onCancel={() => setGameMode("none")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto space-y-0">
          <BannerAd className="mb-4" />

          <div className="mb-6 mt-2">
            <h1 className="text-xl font-bold text-foreground leading-tight">স্বাগতম, <span className="text-primary">{profile?.username || "Player"}</span>!</h1>
            <p className="text-sm text-muted-foreground mt-2">🎮 যত খুশি খেলুন — কোনো সীমা নেই!</p>
          </div>

          <div className="flex gap-1 mb-4 p-1 glass-card rounded-lg">
            <button
              onClick={() => setActiveTab("main")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "main" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> ড্যাশবোর্ড
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "referral" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Users className="w-4 h-4" /> বন্ধু আমন্ত্রণ
            </button>
          </div>

          {activeTab === "main" && (
            <>
              {/* Score Breakdown */}
              <div className="glass-card p-4 mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> স্কোর ব্রেকডাউন
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" /> অ্যাটেম্পট স্কোর
                    </span>
                    <span className="font-bold text-primary">{attemptTotalScore}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-neon-pink" /> রেফার পয়েন্ট
                    </span>
                    <span className="font-bold text-neon-pink">{referralPoints}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-accent" /> স্ট্রিক পয়েন্ট
                    </span>
                    <span className="font-bold text-accent">{streakPoints}</span>
                  </div>
                  <div className="border-t border-border/30 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-foreground font-semibold text-sm">মোট স্কোর</span>
                    <span className="text-xl font-bold text-foreground">{totalScore}</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="glass-card p-4">
                  <Trophy className="w-5 h-5 text-accent mb-1.5" />
                  <p className="text-[11px] text-muted-foreground leading-tight">{t("currentRank")}</p>
                  <p className="text-xl font-bold text-accent mt-0.5">
                    {currentRank ? `#${currentRank}` : "—"}
                  </p>
                </div>
                <div className="glass-card p-4">
                  <Gamepad2 className="w-5 h-5 text-secondary mb-1.5" />
                  <p className="text-[11px] text-muted-foreground leading-tight">মোট গেম খেলা</p>
                  <p className="text-xl font-bold text-secondary mt-0.5">{attemptsUsed}</p>
                </div>
              </div>

              <div className="mb-5">
                <DailyStreak onClaim={async () => { await refreshContest(); }} />
              </div>

              <div className="space-y-3 mb-5">
                <button
                  onClick={() => setGameMode("ranked")}
                  className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  {t("rankedGame")}
                </button>
                <button
                  onClick={() => setGameMode("practice")}
                  className="w-full py-3 rounded-xl glass-card text-secondary font-semibold border border-secondary/30 flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  {t("practiceMode")}
                </button>
              </div>

              {/* Attempt History - Real Data */}
              <div className="glass-card p-4 mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-secondary" /> অ্যাটেম্পট হিস্ট্রি
                </h3>
                {attemptHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">কোনো অ্যাটেম্পট নেই</p>
                ) : (
                  <div className="divide-y divide-border/20">
                    {attemptHistory.map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-sm font-medium text-foreground">অ্যাটেম্পট #{a.attempt_number}</span>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString("bn-BD")} {new Date(a.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span className="font-bold text-primary text-sm">+{a.score}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">মোট অ্যাটেম্পট স্কোর</span>
                      <span className="font-bold text-primary">{attemptHistory.reduce((s, a) => s + a.score, 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <PurchaseHistory />
              </div>

              <RectangleAd className="mb-4" />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: "/leaderboard", icon: Trophy, label: t("leaderboard"), color: "text-accent" },
                  { to: "/winners", icon: Award, label: t("monthlyWinners"), color: "text-neon-gold" },
                  { to: "/payout", icon: CreditCard, label: t("payoutRequest"), color: "text-neon-pink" },
                  { to: "/profile", icon: User, label: t("profile"), color: "text-secondary" },
                ].map((nav, i) => (
                  <Link key={i} to={nav.to} className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors">
                    <nav.icon className={`w-6 h-6 ${nav.color}`} />
                    <span className="text-sm font-medium text-foreground">{nav.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === "referral" && <ReferralSection />}
        </div>
      </div>
      <div className="container px-4 pb-6">
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full py-3 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>
      <Footer />
    </div>
  );
}
