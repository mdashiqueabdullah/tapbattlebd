import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { BannerAd, RectangleAd, ResponsiveAd } from "@/components/ads/AdContainer";
import { Button } from "@/components/ui/button";

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

interface ContestOption {
  id: string;
  month: number;
  year: number;
  status: string;
  label: string;
}

interface WinnerEntry {
  id: string;
  user_id: string;
  final_rank: number;
  prize_amount: number;
  payout_status: string;
  username: string;
}

const PAGE_SIZE = 20;

export default function Winners() {
  const [contests, setContests] = useState<ContestOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load all finalized contests
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("monthly_contests")
        .select("id, month, year, status")
        .eq("status", "finalized")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (data && data.length > 0) {
        setContests(data.map((c: any) => ({
          id: c.id,
          month: c.month,
          year: c.year,
          status: c.status,
          label: `${BANGLA_MONTHS[c.month]} ${c.year}`,
        })));
        setSelectedIndex(0);
      }
      setLoading(false);
    })();
  }, []);

  // Load winners for selected contest
  useEffect(() => {
    if (contests.length === 0) return;
    const contest = contests[selectedIndex];
    if (!contest) return;

    (async () => {
      setWinnersLoading(true);
      setCurrentPage(1);
      const { data } = await supabase
        .from("monthly_winners")
        .select("*")
        .eq("contest_id", contest.id)
        .order("final_rank", { ascending: true });

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
        })));
      } else {
        setWinners([]);
      }
      setWinnersLoading(false);
    })();
  }, [contests, selectedIndex]);

  const selectedContest = contests[selectedIndex];
  const totalPages = Math.ceil(winners.length / PAGE_SIZE);
  const paginatedWinners = winners.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <BannerAd className="mb-4" />
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-foreground">মাসিক বিজয়ী ইতিহাস</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
          ) : contests.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-xl">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">এখনো কোনো বিজয়ী ঘোষণা হয়নি</p>
            </div>
          ) : (
            <>
              {/* Month selector */}
              <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={selectedIndex >= contests.length - 1}
                  onClick={() => setSelectedIndex(i => Math.min(i + 1, contests.length - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <p className="font-bold text-foreground">{selectedContest?.label}</p>
                  <p className="text-xs text-muted-foreground">{winners.length} জন বিজয়ী</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelectedIndex(i => Math.max(i - 1, 0))}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {winnersLoading ? (
                <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
              ) : winners.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-xl">
                  <p className="text-muted-foreground">এই মাসে কোনো বিজয়ী নেই</p>
                </div>
              ) : (
                <>
                  <div className="glass-card divide-y divide-border/20 rounded-xl overflow-hidden">
                    {paginatedWinners.map((w) => (
                      <div key={w.id} className="flex items-center px-4 py-3">
                        <span className="text-lg mr-3 w-8 text-center">
                          {w.final_rank === 1 ? "🥇" : w.final_rank === 2 ? "🥈" : w.final_rank === 3 ? "🥉" : `#${w.final_rank}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{w.username}</p>
                          <p className="text-xs text-muted-foreground">র‍্যাঙ্ক #{w.final_rank}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-display font-bold text-accent text-sm">৳{w.prize_amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[w.payout_status] || "bg-muted text-muted-foreground"}`}>
                            {statusLabels[w.payout_status] || w.payout_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
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
            </>
          )}

          <ResponsiveAd className="mt-4" />
          <RectangleAd className="mt-4" />
        </div>
      </div>
      <Footer />
    </div>
  );
}