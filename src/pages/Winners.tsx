import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockPastWinners } from "@/lib/mock-data";
import { Trophy, Award } from "lucide-react";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";

const statusColors: Record<string, string> = {
  paid: "bg-primary/20 text-primary",
  approved: "bg-accent/20 text-accent",
  pending: "bg-secondary/20 text-secondary",
  submitted: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  paid: "পরিশোধিত",
  approved: "অনুমোদিত",
  pending: "অপেক্ষমাণ",
  submitted: "জমা দেওয়া",
  rejected: "প্রত্যাখ্যাত",
};

export default function Winners() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* ADSENSE: Banner ad top of winners */}
          <BannerAd className="mb-4" />

          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">সাপ্তাহিক বিজয়ী</h1>
          </div>

          {/* Group by week */}
          {["সপ্তাহ ৪", "সপ্তাহ ৩"].map(week => (
            <div key={week} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{week}</h3>
              <div className="glass-card divide-y divide-border/20 rounded-xl overflow-hidden">
                {mockPastWinners
                  .filter(w => w.week === week)
                  .map((w, i) => (
                    <div key={i} className="flex items-center px-4 py-3">
                      <span className="text-lg mr-3">
                        {w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{w.username}</p>
                        <p className="text-xs text-muted-foreground">র‍্যাঙ্ক #{w.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-accent text-sm">৳{w.prize.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[w.status]}`}>
                          {statusLabels[w.status]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
          {/* ADSENSE: Display ad after winners list */}
          <RectangleAd className="mt-4" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
