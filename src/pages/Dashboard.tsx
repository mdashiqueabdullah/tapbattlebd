import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import TapGame from "@/components/TapGame";
import ReferralSection from "@/components/ReferralSection";
import BuyAttemptsDialog from "@/components/BuyAttemptsDialog";
import PurchaseHistory from "@/components/PurchaseHistory";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/i18n";
import { MAX_RANKED_ATTEMPTS } from "@/lib/prizes";
import { mockAttemptHistory } from "@/lib/mock-data";
import { Gamepad2, Trophy, Award, Clock, Target, BarChart3, User, CreditCard, Users, Gift, ShoppingCart, Flame, ListOrdered, LogOut } from "lucide-react";
import DailyStreak from "@/components/DailyStreak";

export default function Dashboard() {
  const [gameMode, setGameMode] = useState<"none" | "ranked" | "practice">("none");
  const [activeTab, setActiveTab] = useState<"main" | "referral">("main");
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Score breakdown
  const attemptTotal = 95; // sum of all ranked attempt scores (mock)
  const referralPoints = profile?.referral_points ?? 0;
  const streakPoints = 15; // mock — from daily_streaks.total_streak_points
  const totalScore = attemptTotal + referralPoints + streakPoints;
  const extraAttempts = (profile as any)?.extra_attempts ?? 0;
  const attemptsUsed = 3;

  const userData = {
    username: profile?.username || "Player_BD",
    currentRank: 28,
  };

  const totalAttempts = MAX_RANKED_ATTEMPTS + extraAttempts;

  if (gameMode !== "none") {
    return (
      <TapGame
        isPractice={gameMode === "practice"}
        attemptsRemaining={totalAttempts - attemptsUsed}
        onGameEnd={(score) => {
          console.log("Game ended with score:", score);
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
          {/* ADSENSE: Banner ad top of dashboard */}
          <BannerAd className="mb-4" />

          {/* Welcome */}
          <div className="mb-6 mt-2">
            <h1 className="text-xl font-bold text-foreground leading-tight">স্বাগতম, <span className="text-primary">{userData.username}</span>!</h1>
            <p className="text-sm text-muted-foreground mt-2">{t("contestEnds")}: <CountdownTimer compact /></p>
          </div>

          {/* Dashboard Tabs */}
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
                    <span className="font-display font-bold text-primary">{attemptTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-neon-pink" /> রেফার পয়েন্ট
                    </span>
                    <span className="font-display font-bold text-neon-pink">{referralPoints}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-accent" /> স্ট্রিক পয়েন্ট
                    </span>
                    <span className="font-display font-bold text-accent">{streakPoints}</span>
                  </div>
                  <div className="border-t border-border/30 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-foreground font-semibold text-sm">মোট স্কোর</span>
                    <span className="font-display text-xl font-bold text-foreground">{totalScore}</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="glass-card p-4">
                  <Trophy className="w-5 h-5 text-accent mb-1.5" />
                  <p className="text-[11px] text-muted-foreground leading-tight">{t("currentRank")}</p>
                  <p className="font-display text-xl font-bold text-accent mt-0.5">#{userData.currentRank}</p>
                </div>
                <div className="glass-card p-4">
                  <Clock className="w-5 h-5 text-secondary mb-1.5" />
                  <p className="text-[11px] text-muted-foreground leading-tight">{t("attemptsUsed")}</p>
                  <p className="font-display text-xl font-bold text-secondary mt-0.5">{attemptsUsed}/{totalAttempts}</p>
                </div>
              </div>

              {/* Extra Attempts Info */}
              {extraAttempts > 0 && (
                <div className="glass-card p-3 mb-4 rounded-lg flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">
                    অতিরিক্ত অ্যাটেম্পট: <span className="font-bold text-accent">{extraAttempts}</span>
                  </span>
                </div>
              )}

              {/* Daily Streak */}
              <div className="mb-5">
                <DailyStreak />
              </div>

              {/* Play Buttons */}
              <div className="space-y-3 mb-5">
                <button
                  onClick={() => setGameMode("ranked")}
                  disabled={attemptsUsed >= totalAttempts}
                  className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* Buy Extra Attempts */}
              <button
                onClick={() => setShowBuyDialog(true)}
                className="w-full py-3 rounded-xl glass-card border border-accent/30 hover:border-accent/60 transition-colors flex items-center justify-center gap-2 mb-6"
              >
                <ShoppingCart className="w-5 h-5 text-accent" />
                <span className="font-semibold text-foreground">অতিরিক্ত অ্যাটেম্পট কিনুন</span>
                <span className="font-display font-bold text-accent">৩০৳ থেকে</span>
              </button>

              {/* Attempt History */}
              <div className="glass-card p-4 mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-secondary" /> অ্যাটেম্পট হিস্ট্রি
                </h3>
                {mockAttemptHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">কোনো অ্যাটেম্পট নেই</p>
                ) : (
                  <div className="divide-y divide-border/20">
                    {mockAttemptHistory.map((a) => (
                      <div key={a.attempt} className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-sm font-medium text-foreground">অ্যাটেম্পট #{a.attempt}</span>
                          <p className="text-[11px] text-muted-foreground">{a.date}</p>
                        </div>
                        <span className="font-display font-bold text-primary text-sm">+{a.score}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">মোট অ্যাটেম্পট স্কোর</span>
                      <span className="font-display font-bold text-primary">{mockAttemptHistory.reduce((s, a) => s + a.score, 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="mb-6">
                <PurchaseHistory />
              </div>

              {/* ADSENSE: Rectangle ad below stats */}
              <RectangleAd className="mb-4" />

              {/* Navigation Cards */}
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
      <Footer />

      <BuyAttemptsDialog
        open={showBuyDialog}
        onClose={() => setShowBuyDialog(false)}
        onSuccess={() => refreshProfile()}
      />
    </div>
  );
}
