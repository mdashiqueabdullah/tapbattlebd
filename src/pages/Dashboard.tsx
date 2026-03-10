import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import TapGame from "@/components/TapGame";
import ReferralSection from "@/components/ReferralSection";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/i18n";
import { MAX_RANKED_ATTEMPTS } from "@/lib/prizes";
import { Gamepad2, Trophy, Award, Clock, Target, BarChart3, User, CreditCard, Users, Gift } from "lucide-react";
import DailyStreak from "@/components/DailyStreak";

export default function Dashboard() {
  const [gameMode, setGameMode] = useState<"none" | "ranked" | "practice">("none");
  const [activeTab, setActiveTab] = useState<"main" | "referral">("main");
  const { profile } = useAuth();

  // Use profile data or fallback to mock
  const gameScore = profile?.lifetime_best_score ?? 65;
  const referralPoints = profile?.referral_points ?? 0;
  const totalScore = gameScore + referralPoints;

  const userData = {
    username: profile?.username || "Player_BD",
    attemptsUsed: 3,
    gameScore,
    referralPoints,
    totalScore,
    currentRank: 28,
  };

  if (gameMode !== "none") {
    return (
      <TapGame
        isPractice={gameMode === "practice"}
        attemptsRemaining={MAX_RANKED_ATTEMPTS - userData.attemptsUsed}
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
      <div className="container pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* ADSENSE: Banner ad top of dashboard */}
          <BannerAd className="mb-4" />

          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">স্বাগতম, <span className="text-primary">{userData.username}</span>!</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("contestEnds")}: <CountdownTimer compact /></p>
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
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Target, label: "গেম স্কোর", value: userData.gameScore, color: "text-primary" },
                  { icon: Gift, label: "রেফার পয়েন্ট", value: userData.referralPoints, color: "text-neon-pink" },
                  { icon: BarChart3, label: "মোট স্কোর", value: userData.totalScore, color: "text-accent" },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-4">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Trophy, label: t("currentRank"), value: `#${userData.currentRank}`, color: "text-accent" },
                  { icon: Clock, label: t("attemptsUsed"), value: `${userData.attemptsUsed}/${MAX_RANKED_ATTEMPTS}`, color: "text-secondary" },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-4">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Play Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setGameMode("ranked")}
                  disabled={userData.attemptsUsed >= MAX_RANKED_ATTEMPTS}
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
    </div>
  );
}
