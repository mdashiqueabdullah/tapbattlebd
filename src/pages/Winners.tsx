import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award } from "lucide-react";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";

const BANGLA_MONTHS = [
  "", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const statusColors: Record<string, string> = {
  paid: "bg-primary/20 text-primary",
  approved: "bg-accent/20 text-accent",
  pending: "bg-secondary/20 text-secondary",
};
const statusLabels: Record<string, string> = {
  paid: "পরিশোধিত",
  approved: "অনুমোদিত",
  pending: "অপেক্ষমাণ",
};

interface WinnerEntry {
  id: string;
  user_id: string;
  final_rank: number;
  prize_amount: number;
  payout_status: string;
  username: string;
  month: number;
  year: number;
  monthLabel: string;
}

export default function Winners() {
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("monthly_winners")
        .select("*, monthly_contests(month, year)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data && data.length > 0) {
        const userIds = data.map((w: any) => w.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", userIds);
        const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.username]));

        setWinners(data.map((w: any) => ({
          id: w.id,
          user_id: w.user_id,
          final_rank: w.final_rank,
          prize_amount: w.prize_amount,
          payout_status: w.payout_status,
          username: nameMap.get(w.user_id) || "Unknown",
          month: (w as any).monthly_contests?.month ?? 0,
          year: (w as any).monthly_contests?.year ?? 0,
          monthLabel: `${BANGLA_MONTHS[(w as any).monthly_contests?.month ?? 0]} ${(w as any).monthly_contests?.year ?? ""}`,
        })));
      }
      setLoading(false);
    })();
  }, []);

  const months = [...new Set(winners.map(w => w.monthLabel))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <BannerAd className="mb-4" />
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">মাসিক বিজয়ী</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
          ) : winners.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-xl">
              <p className="text-muted-foreground">এখনো কোনো বিজয়ী ঘোষণা হয়নি</p>
            </div>
          ) : (
            months.map(month => (
              <div key={month} className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">{month}</h3>
                <div className="glass-card divide-y divide-border/20 rounded-xl overflow-hidden">
                  {winners
                    .filter(w => w.monthLabel === month)
                    .sort((a, b) => a.final_rank - b.final_rank)
                    .map((w) => (
                      <div key={w.id} className="flex items-center px-4 py-3">
                        <span className="text-lg mr-3">
                          {w.final_rank === 1 ? "🥇" : w.final_rank === 2 ? "🥈" : w.final_rank === 3 ? "🥉" : `#${w.final_rank}`}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{w.username}</p>
                          <p className="text-xs text-muted-foreground">র‍্যাঙ্ক #{w.final_rank}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-accent text-sm">৳{w.prize_amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[w.payout_status] || "bg-muted text-muted-foreground"}`}>
                            {statusLabels[w.payout_status] || w.payout_status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}

          <RectangleAd className="mt-4" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
