import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Shield, Zap, Star, Users, Gift, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import PrizeTable from "@/components/PrizeTable";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardPreview {
  rank: number;
  username: string;
  totalScore: number;
}

export default function Index() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardPreview[]>([]);

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

      const { data } = await supabase
        .from("leaderboard")
        .select("user_id, total_score")
        .eq("contest_id", contestData.id)
        .order("total_score", { ascending: false })
        .limit(5);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container relative z-10 text-center pt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card neon-border mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t("freeToPlay")}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
              <span className="text-primary neon-text">TAP</span>{" "}
              <span className="text-accent neon-text-gold">BATTLE</span>{" "}
              <span className="text-secondary neon-text-purple">BD</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-2">{t("heroSubtitle")}</p>
            <div className="my-8">
              <p className="text-sm text-muted-foreground mb-3">{t("contestEnds")}</p>
              <CountdownTimer />
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
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-14">
            <span className="inline-block font-display text-xs tracking-[0.2em] uppercase text-primary/70 mb-2">How it works</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("howItWorks")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-5xl mx-auto">
            {[
              { icon: Users, title: "ফ্রি রেজিস্ট্রেশন করুন", step: "ধাপ ১", color: "text-primary", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.15)]", borderGlow: "hover:border-primary/40", note: "অ্যাকাউন্ট তৈরি করে সহজেই গেম শুরু করুন এবং প্রতিযোগিতায় অংশ নিন।" },
              { icon: Gamepad2, title: "যত খুশি ট্যাপ করুন", step: "ধাপ ২", color: "text-secondary", glow: "shadow-[0_0_20px_hsl(var(--neon-purple)/0.15)]", borderGlow: "hover:border-secondary/40", note: "আপনি যতক্ষণ ট্যাপ করতে থাকবেন গেম চলবে। নিষ্ক্রিয় থাকলে সেশন শেষ হবে।" },
              { icon: Star, title: "লিডারবোর্ডে উঠুন", step: "ধাপ ৩", color: "text-accent", glow: "shadow-[0_0_20px_hsl(var(--neon-gold)/0.15)]", borderGlow: "hover:border-accent/40", note: "বেশি স্কোর করে লিডারবোর্ডে উপরে উঠুন এবং অন্য খেলোয়াড়দের সাথে প্রতিযোগিতা করুন।" },
              { icon: Gift, title: "পুরস্কার জিতুন!", step: "ধাপ ৪", color: "text-neon-pink", glow: "shadow-[0_0_20px_hsl(var(--neon-pink)/0.15)]", borderGlow: "hover:border-neon-pink/40", note: "মাসের শেষে সেরা খেলোয়াড়রা পুরস্কার জিতে নেবে।" },
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

      {/* Prize Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/20">
        <div className="container max-w-lg">
          <h2 className="text-2xl font-bold text-center text-foreground mb-3">{t("prizeBreakdown")}</h2>
          <p className="text-center text-muted-foreground mb-8">প্রতি মাসে টপ ১০০ জন পুরস্কার পায়</p>
          <PrizeTable />
        </div>
      </section>

      <div className="container max-w-lg px-4"><RectangleAd /></div>

      {/* Live Leaderboard Preview */}
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">🔥 লাইভ লিডারবোর্ড</h2>
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

      {/* Trust */}
      <section className="py-12 md:py-16 px-4 bg-muted/10">
        <div className="container max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: t("trustFree"), desc: "কোনো এন্ট্রি ফি নেই" },
              { icon: Trophy, title: t("trustWinners"), desc: "bKash/Nagad দিয়ে পেআউট" },
              { icon: Zap, title: t("trustSecure"), desc: "অ্যান্টি-চিট সিস্টেম" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-5 md:p-6 text-center">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 text-center">
        <div className="container max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">আজই শুরু করুন!</h2>
          <p className="text-muted-foreground mb-6">ফ্রি রেজিস্টার করুন এবং এই মাসের কনটেস্টে অংশ নিন</p>
          <Link to="/register" className="inline-block w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border">
            {t("signUp")} — সম্পূর্ণ ফ্রি! 🚀
          </Link>
        </div>
      </section>

      <div className="container max-w-lg px-4"><BannerAd /></div>
      <Footer />
    </div>
  );
}
