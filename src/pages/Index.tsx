import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gamepad2, Trophy, Shield, Zap, Star, Users, Gift, ChevronRight,
  Clock, Target, Award, Smartphone, CreditCard, HelpCircle, TrendingUp,
  CheckCircle, Flame, Crown, Sparkles, Timer, MousePointerClick
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import PrizeTable from "@/components/PrizeTable";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  MAX_RANKED_ATTEMPTS, INACTIVITY_TIMEOUT_SECONDS,
  GOLDEN_TARGET_POINTS, RED_TARGET_POINTS, MEGA_TARGET_POINTS, NORMAL_TARGET_POINTS,
  COMBO_THRESHOLD_2X, COMBO_THRESHOLD_3X
} from "@/lib/prizes";

interface LeaderboardPreview {
  rank: number;
  username: string;
  totalScore: number;
}

export default function Index() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardPreview[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    (async () => {
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

      if (!contestData) return;

      const { data, count } = await supabase
        .from("leaderboard")
        .select("user_id, total_score", { count: "exact" })
        .eq("contest_id", contestData.id)
        .order("total_score", { ascending: false })
        .limit(5);

      if (count) setTotalPlayers(count);

      if (data && data.length > 0) {
        const userIds = data.map((e: any) => e.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", userIds);
        const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username]));

        setTopPlayers(data.map((e: any, i: number) => ({
          rank: i + 1,
          username: nameMap.get(e.user_id) || "Unknown",
          totalScore: e.total_score ?? 0,
        })));
      }
    })();
  }, []);

  const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />

        <div className="container relative z-10 text-center pt-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card neon-border mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t("freeToPlay")} — কোনো এন্ট্রি ফি নেই</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
              <span className="text-primary neon-text">TAP</span>{" "}
              <span className="text-accent neon-text-gold">BATTLE</span>{" "}
              <span className="text-secondary neon-text-purple">BD</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-2">{t("heroSubtitle")}</p>
            <p className="text-sm text-muted-foreground/80 max-w-md mx-auto mb-6">
              বাংলাদেশের প্রথম ট্যাপ-ভিত্তিক গেমিং প্ল্যাটফর্ম — ফ্রি খেলুন, bKash/Nagad এ পুরস্কার নিন!
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent">৳১৫,০০০</span>
                <span className="text-xs text-muted-foreground">মাসিক পুরস্কার</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{totalPlayers || "০"}+</span>
                <span className="text-xs text-muted-foreground">খেলোয়াড়</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-sm font-bold text-secondary">১০০</span>
                <span className="text-xs text-muted-foreground">বিজয়ী/মাস</span>
              </div>
            </div>

            <div className="my-6">
              <div className="glass-card px-4 py-3 rounded-xl inline-flex items-center gap-2 neon-border">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent">কোনো সীমা নেই — যত খুশি খেলুন!</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link to="/dashboard" className="flex-1 py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-lg text-center neon-border">
                {t("playNow")} 🎮
              </Link>
              <Link to="/leaderboard" className="flex-1 py-3.5 rounded-xl glass-card text-foreground font-semibold text-lg text-center border border-border/50">
                {t("leaderboard")} 🏆
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-lg px-4"><BannerAd /></div>

      {/* How It Works */}
      <section className="py-14 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="container relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10 md:mb-14">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-primary/70 mb-2">How it works</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("howItWorks")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">মাত্র ৪ টি ধাপে শুরু করুন আপনার ট্যাপ যাত্রা</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-5xl mx-auto">
            {[
              { icon: Users, title: "ফ্রি রেজিস্ট্রেশন করুন", step: "ধাপ ১", color: "text-primary", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.15)]", borderGlow: "hover:border-primary/40", note: "ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করুন, ভেরিফাই করুন এবং গেমে প্রবেশ করুন।" },
              { icon: Gamepad2, title: "যত খুশি ট্যাপ করুন", step: "ধাপ ২", color: "text-secondary", glow: "shadow-[0_0_20px_hsl(var(--neon-purple)/0.15)]", borderGlow: "hover:border-secondary/40", note: `${INACTIVITY_TIMEOUT_SECONDS} সেকেন্ড নিষ্ক্রিয় থাকলে সেশন শেষ হয়। মাসে ${MAX_RANKED_ATTEMPTS}টি র‍্যাঙ্কড সুযোগ।` },
              { icon: Star, title: "লিডারবোর্ডে উঠুন", step: "ধাপ ৩", color: "text-accent", glow: "shadow-[0_0_20px_hsl(var(--neon-gold)/0.15)]", borderGlow: "hover:border-accent/40", note: "মোট স্কোর = গেম স্কোর + রেফার পয়েন্ট + স্ট্রিক পয়েন্ট। বেশি স্কোর = বেশি পুরস্কার!" },
              { icon: Gift, title: "পুরস্কার জিতুন!", step: "ধাপ ৪", color: "text-neon-pink", glow: "shadow-[0_0_20px_hsl(var(--neon-pink)/0.15)]", borderGlow: "hover:border-neon-pink/40", note: "মাসের শেষে টপ ১০০ জন bKash/Nagad এ সরাসরি পুরস্কার পায়।" },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`glass-card p-5 md:p-6 text-center flex flex-col items-center transition-all duration-300 ${step.glow} ${step.borderGlow} hover:scale-[1.03] hover:-translate-y-1`}>
                <span className="font-display text-[10px] tracking-widest uppercase text-muted-foreground mb-3">{step.step}</span>
                <div className={`w-14 h-14 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mb-4 ${step.color}`}><step.icon className="w-7 h-7" /></div>
                <h3 className="text-base font-bold text-foreground leading-snug mb-2">{step.title}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground mt-auto">{step.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Mechanics Details */}
      <section className="py-12 md:py-16 px-4 bg-muted/10">
        <div className="container max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-secondary/70 mb-2">Game Mechanics</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">গেমের বিস্তারিত নিয়ম</h2>
            <p className="text-sm text-muted-foreground mt-2">কিভাবে পয়েন্ট অর্জন করবেন, কম্বো সিস্টেম এবং বিশেষ টার্গেট</p>
          </motion.div>

          {/* Ball Types */}
          <motion.div {...fadeUp} className="glass-card p-5 md:p-6 mb-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> টার্গেট / বল টাইপ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "সাধারণ", points: `+${NORMAL_TARGET_POINTS}`, color: "bg-primary/10 border-primary/30 text-primary", emoji: "⚪" },
                { name: "গোল্ডেন", points: `+${GOLDEN_TARGET_POINTS}`, color: "bg-accent/10 border-accent/30 text-accent", emoji: "🟡" },
                { name: "মেগা", points: `+${MEGA_TARGET_POINTS}`, color: "bg-secondary/10 border-secondary/30 text-secondary", emoji: "🟣" },
                { name: "রেড (বিপদ!)", points: `${RED_TARGET_POINTS}`, color: "bg-destructive/10 border-destructive/30 text-destructive", emoji: "🔴" },
              ].map((ball, i) => (
                <div key={i} className={`rounded-xl border p-3 text-center ${ball.color}`}>
                  <span className="text-2xl block mb-1">{ball.emoji}</span>
                  <p className="font-bold text-sm">{ball.name}</p>
                  <p className="font-display text-lg font-black">{ball.points}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Combo & Special */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <motion.div {...fadeUp} className="glass-card p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" /> কম্বো সিস্টেম
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">2×</span>
                  <span>পরপর <strong className="text-foreground">{COMBO_THRESHOLD_2X}</strong> টি হিটে ডাবল পয়েন্ট</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">3×</span>
                  <span>পরপর <strong className="text-foreground">{COMBO_THRESHOLD_3X}</strong> টি হিটে ট্রিপল পয়েন্ট</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-0.5">4×</span>
                  <span>পরপর <strong className="text-foreground">১৫+</strong> টি হিটে কম্বো ফ্রেঞ্জি মোড (৬ সেকেন্ড)</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground/70 mt-3">💡 মিস করলে কম্বো রিসেট হয়ে যাবে!</p>
            </motion.div>

            <motion.div {...fadeUp} className="glass-card p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" /> বিশেষ ইভেন্ট
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">🦁</span>
                  <span><strong className="text-foreground">লায়ন বোনাস:</strong> +২০ পয়েন্ট (বিরল!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">🎁</span>
                  <span><strong className="text-foreground">লাকি চেস্ট:</strong> ১০-৩০ র‍্যান্ডম পয়েন্ট</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">⚡</span>
                  <span><strong className="text-foreground">ডাবল স্কোর:</strong> ৫ সেকেন্ড সব পয়েন্ট ডাবল</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground/70 mt-3">💡 এগুলো র‍্যান্ডমলি আসে — ভাগ্য পরীক্ষা করুন!</p>
            </motion.div>
          </div>

          {/* Session Rules */}
          <motion.div {...fadeUp} className="glass-card p-5">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" /> সেশন নিয়ম
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>কোনো সময়সীমা নেই — যতক্ষণ ট্যাপ করবেন, ততক্ষণ চলবে</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MousePointerClick className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>{INACTIVITY_TIMEOUT_SECONDS} সেকেন্ড নিষ্ক্রিয় থাকলে সেশন স্বয়ংক্রিয়ভাবে শেষ হয়</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <Gamepad2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>প্রতি মাসে {MAX_RANKED_ATTEMPTS}টি র‍্যাঙ্কড গেম + আনলিমিটেড প্র্যাকটিস</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Score Calculation */}
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-2xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-accent/70 mb-2">Score System</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">স্কোর কিভাবে গণনা হয়?</h2>
          </motion.div>
          <motion.div {...fadeUp} className="glass-card p-5 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground text-sm">লিডারবোর্ড মোট স্কোর</p>
                  <p className="text-xs text-muted-foreground mt-0.5">= সব র‍্যাঙ্কড গেমের মোট স্কোর + রেফার পয়েন্ট + ডেইলি স্ট্রিক পয়েন্ট</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                  <Gamepad2 className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">গেম স্কোর</p>
                  <p className="font-bold text-foreground text-sm">{MAX_RANKED_ATTEMPTS}টি গেমের যোগফল</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                  <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">রেফার পয়েন্ট</p>
                  <p className="font-bold text-foreground text-sm">প্রতি রেফারে ৫,০০০</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                  <Flame className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">স্ট্রিক পয়েন্ট</p>
                  <p className="font-bold text-foreground text-sm">প্রতিদিন ক্লেইম করুন</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">টাই-ব্রেকার:</strong> ১) বেশি স্কোর → ২) কম সুযোগ ব্যবহার → ৩) আগে স্কোর আপডেট
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prize Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/20">
        <div className="container max-w-lg">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-accent/70 mb-2">Prizes</span>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("prizeBreakdown")}</h2>
            <p className="text-muted-foreground text-sm">প্রতি মাসে টপ ১০০ জন পুরস্কার পায় — সরাসরি bKash/Nagad এ!</p>
          </motion.div>
          <PrizeTable />
        </div>
      </section>

      <div className="container max-w-lg px-4"><RectangleAd /></div>

      {/* Live Leaderboard Preview */}
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              লাইভ লিডারবোর্ড
            </h2>
            <Link to="/leaderboard" className="text-sm text-primary flex items-center gap-1">সব দেখুন <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="glass-card divide-y divide-border/20 overflow-hidden">
            {topPlayers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">এখনো কোনো ডেটা নেই। প্রথম খেলোয়াড় হোন!</div>
            ) : (
              topPlayers.map((entry) => (
                <div key={entry.rank} className="flex items-center px-4 py-3">
                  <span className={`font-display font-bold w-8 ${entry.rank <= 3 ? "text-accent" : "text-muted-foreground"}`}>
                    {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <span className="flex-1 font-medium text-foreground ml-2">{entry.username}</span>
                  <span className="font-display font-bold text-primary">{entry.totalScore}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/10">
        <div className="container max-w-2xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-secondary/70 mb-2">Referral</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">বন্ধুদের আমন্ত্রণ করুন, পয়েন্ট পান!</h2>
            <p className="text-sm text-muted-foreground mt-2">রেফার করে লিডারবোর্ডে এগিয়ে যান</p>
          </motion.div>
          <motion.div {...fadeUp} className="glass-card p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-5">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Gift className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-black text-primary">৫,০০০</p>
                <p className="text-xs text-muted-foreground">প্রতি সফল রেফারে পয়েন্ট</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="font-display text-2xl font-black text-secondary">∞</p>
                <p className="text-xs text-muted-foreground">আনলিমিটেড রেফার</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-2xl font-black text-accent">+</p>
                <p className="text-xs text-muted-foreground">মোট স্কোরে যুক্ত হয়</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>রেফার্ড ইউজারকে ইমেইল ভেরিফাই করতে হবে</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>রেফার পয়েন্ট সাথে সাথে লিডারবোর্ডে যুক্ত হয়</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>নিজে নিজেকে রেফার করা এবং ডুপ্লিকেট অ্যাকাউন্ট নিষিদ্ধ</span>
              </div>
            </div>
            <div className="mt-5 text-center">
              <Link to="/referral-rules" className="text-sm text-primary font-semibold hover:underline">
                সম্পূর্ণ রেফার রুলস দেখুন →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payout Info */}
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-2xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-accent/70 mb-2">Payout</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">পেআউট কিভাবে পাবেন?</h2>
          </motion.div>
          <motion.div {...fadeUp} className="glass-card p-5 md:p-6">
            <div className="space-y-4">
              {[
                { step: "১", icon: Trophy, text: "মাসের শেষে টপ ১০০ তে থাকুন", desc: "প্রতি মাসের ১ তারিখ থেকে শেষ দিন পর্যন্ত প্রতিযোগিতা চলে" },
                { step: "২", icon: CreditCard, text: "পেআউট রিকোয়েস্ট দিন", desc: "bKash বা Nagad নম্বর দিয়ে পেআউট রিকোয়েস্ট করুন" },
                { step: "৩", icon: CheckCircle, text: "অ্যাডমিন রিভিউ ও পেমেন্ট", desc: "অ্যাডমিন ভেরিফাই করে ৩-৫ কর্মদিবসের মধ্যে পেমেন্ট করে" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-accent">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-accent" /> {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust / Security */}
      <section className="py-12 md:py-16 px-4 bg-muted/10">
        <div className="container max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-primary/70 mb-2">Trust & Security</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">কেন Tap Battle BD বিশ্বাসযোগ্য?</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "সম্পূর্ণ ফ্রি", desc: "কোনো এন্ট্রি ফি বা লুকানো চার্জ নেই", color: "text-primary" },
              { icon: Trophy, title: "প্রতি মাসে ৳১৫,০০০", desc: "bKash/Nagad এ সরাসরি পেমেন্ট", color: "text-accent" },
              { icon: Zap, title: "অ্যান্টি-চিট সিস্টেম", desc: "বট ডিটেকশন ও ডিভাইস ভেরিফিকেশন", color: "text-secondary" },
              { icon: Smartphone, title: "১ ডিভাইস = ১ অ্যাকাউন্ট", desc: "ন্যায্য প্রতিযোগিতা নিশ্চিত করা হয়", color: "text-primary" },
              { icon: Crown, title: "১০০ জন বিজয়ী", desc: "শুধু ১ম নয়, টপ ১০০ জনই পুরস্কার পায়", color: "text-accent" },
              { icon: Award, title: "স্বচ্ছ লিডারবোর্ড", desc: "রিয়েল-টাইম র‍্যাঙ্কিং সবার জন্য দৃশ্যমান", color: "text-secondary" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="glass-card p-5 text-center hover:scale-[1.02] transition-transform">
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                <h3 className="font-bold text-foreground mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-2xl">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-primary/70 mb-2">FAQ</span>
            <h2 className="text-2xl font-bold text-foreground">সচরাচর জিজ্ঞাসা</h2>
          </motion.div>
          <motion.div {...fadeUp} className="space-y-3">
            {[
              { q: "খেলতে কি টাকা লাগে?", a: "না! Tap Battle BD সম্পূর্ণ ফ্রি। কোনো এন্ট্রি ফি, সাবস্ক্রিপশন বা লুকানো চার্জ নেই।" },
              { q: "কিভাবে পুরস্কার পাবো?", a: "মাসের শেষে টপ ১০০ তে থাকলে bKash বা Nagad এ সরাসরি পেমেন্ট করা হয়।" },
              { q: "প্র্যাকটিস মোড কি আলাদা?", a: "হ্যাঁ! প্র্যাকটিস মোডে যতবার খুশি খেলুন — এটা র‍্যাঙ্কিং এ গণনা হবে না।" },
              { q: "একাধিক অ্যাকাউন্ট করা যাবে?", a: "না। এক ডিভাইস থেকে শুধুমাত্র একটি অ্যাকাউন্ট তৈরি করা যায়।" },
            ].map((faq, i) => (
              <div key={i} className="glass-card p-4">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary flex-shrink-0" /> {faq.q}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 ml-6">{faq.a}</p>
              </div>
            ))}
          </motion.div>
          <div className="text-center mt-5">
            <Link to="/faq" className="text-sm text-primary font-semibold hover:underline">
              আরো প্রশ্ন দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="container max-w-md relative z-10">
          <motion.div {...fadeUp}>
            <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">আজই শুরু করুন!</h2>
            <p className="text-muted-foreground mb-6">ফ্রি রেজিস্টার করুন এবং এই মাসের কনটেস্টে অংশ নিন।<br />আপনিও হতে পারেন পরবর্তী বিজয়ী!</p>
            <Link to="/register" className="inline-block w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border">
              {t("signUp")} — সম্পূর্ণ ফ্রি! 🚀
            </Link>
            <p className="text-xs text-muted-foreground mt-4">ইমেইল দিয়ে ৩০ সেকেন্ডে রেজিস্টার করুন</p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-lg px-4"><BannerAd /></div>
      <Footer />
    </div>
  );
}
