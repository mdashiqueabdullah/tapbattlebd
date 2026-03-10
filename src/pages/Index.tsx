import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Shield, Zap, Star, Users, Gift, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import PrizeTable from "@/components/PrizeTable";
import { t } from "@/lib/i18n";
import { mockLeaderboard } from "@/lib/mock-data";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container relative z-10 text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card neon-border mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t("freeToPlay")}</span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
              <span className="text-primary neon-text">TAP</span>{" "}
              <span className="text-accent neon-text-gold">BATTLE</span>{" "}
              <span className="text-secondary neon-text-purple">BD</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-2">
              {t("heroSubtitle")}
            </p>

            <div className="my-8">
              <p className="text-sm text-muted-foreground mb-3">{t("contestEnds")}</p>
              <CountdownTimer />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                to="/dashboard"
                className="flex-1 py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-lg text-center neon-border"
              >
                {t("playNow")} 🎮
              </Link>
              <Link
                to="/leaderboard"
                className="flex-1 py-3.5 rounded-xl glass-card text-foreground font-semibold text-lg text-center border border-border/50"
              >
                {t("leaderboard")} 🏆
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ADSENSE: Banner ad below hero */}
      <div className="container max-w-lg px-4">
        <BannerAd />
      </div>

      {/* How It Works */}
      <section className="py-12 md:py-16 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8 md:mb-10">{t("howItWorks")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
            {[
              { icon: Users, text: t("howStep1"), color: "text-primary" },
              { icon: Gamepad2, text: t("howStep2"), color: "text-secondary" },
              { icon: Star, text: t("howStep3"), color: "text-accent" },
              { icon: Gift, text: t("howStep4"), color: "text-neon-pink" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 md:p-5 text-center"
              >
                <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-foreground">{step.text}</p>
                <span className="font-display text-xs text-muted-foreground">ধাপ {i + 1}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Section */}
      <section className="py-12 md:py-16 px-4 bg-muted/20">
        <div className="container max-w-lg">
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">{t("prizeBreakdown")}</h2>
          <p className="text-center text-muted-foreground mb-6">প্রতি মাসে টপ ১০০ জন পুরস্কার পায়</p>
          <PrizeTable />
        </div>
      </section>

      {/* ADSENSE: Rectangle ad below How It Works */}
      <div className="container max-w-lg px-4">
        <RectangleAd />
      </div>

      {/* Live Leaderboard Preview */}
      <section className="py-12 px-4">
        <div className="container max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">🔥 লাইভ লিডারবোর্ড</h2>
            <Link to="/leaderboard" className="text-sm text-primary flex items-center gap-1">
              সব দেখুন <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass-card divide-y divide-border/20 overflow-hidden">
            {mockLeaderboard.slice(0, 5).map((entry) => (
              <div key={entry.rank} className="flex items-center px-4 py-3">
                <span className={`font-display font-bold w-8 ${entry.rank <= 3 ? "text-accent" : "text-muted-foreground"}`}>
                  {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <span className="flex-1 font-medium text-foreground ml-2">{entry.username}</span>
                <span className="font-display font-bold text-primary">{entry.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-4 bg-muted/10">
        <div className="container max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: t("trustFree"), desc: "কোনো এন্ট্রি ফি নেই" },
              { icon: Trophy, title: t("trustWinners"), desc: "bKash/Nagad দিয়ে পেআউট" },
              { icon: Zap, title: t("trustSecure"), desc: "অ্যান্টি-চিট সিস্টেম" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-5 text-center">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="container max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">আজই শুরু করুন!</h2>
          <p className="text-muted-foreground mb-6">ফ্রি রেজিস্টার করুন এবং এই মাসের কনটেস্টে অংশ নিন</p>
          <Link
            to="/register"
            className="inline-block w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border"
          >
            {t("signUp")} — সম্পূর্ণ ফ্রি! 🚀
          </Link>
        </div>
      </section>

      {/* ADSENSE: Banner ad before footer */}
      <div className="container max-w-lg px-4">
        <BannerAd />
      </div>

      <Footer />
    </div>
  );
}
