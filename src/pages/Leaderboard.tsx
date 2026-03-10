import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import { t } from "@/lib/i18n";
import { mockLeaderboard } from "@/lib/mock-data";
import { Trophy } from "lucide-react";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";

const tabs = [
  { key: "current", label: "চলতি মাস" },
  { key: "previous", label: "আগের মাস" },
  { key: "mine", label: "আমার র‍্যাঙ্কিং" },
];

export default function Leaderboard() {
  const [tab, setTab] = useState("current");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          {/* ADSENSE: Banner ad top of leaderboard */}
          <BannerAd className="mb-4" />

          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">মাসিক লিডারবোর্ড</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("contestEnds")}: <CountdownTimer compact /></p>
          <p className="text-[11px] text-muted-foreground mb-4">মোট স্কোর = অ্যাটেম্পট + রেফার + স্ট্রিক</p>

          {/* Tabs */}
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

          {/* Top 3 */}
          <div className="flex justify-center items-end gap-2 sm:gap-3 mb-6 px-2">
            {[1, 0, 2].map(idx => {
              const entry = mockLeaderboard[idx];
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
            {mockLeaderboard.map(entry => (
              <div key={entry.rank} className={`flex items-center px-3 py-3 ${entry.rank <= 3 ? "bg-accent/5" : ""}`}>
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

          {/* ADSENSE: Rectangle ad below leaderboard */}
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
