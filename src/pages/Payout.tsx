import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Check, History, AlertTriangle, Trophy } from "lucide-react";
import { formatBDT } from "@/lib/prizes";

interface PayoutRequest {
  id: string;
  prize_amount: number;
  final_rank: number | null;
  payment_method: string;
  account_number: string;
  status: string;
  created_at: string;
}

interface WinnerInfo {
  final_rank: number;
  prize_amount: number;
  contest_id: string;
}

function getPrizeByRank(rank: number): number | null {
  if (rank === 1) return 3000;
  if (rank === 2) return 2000;
  if (rank === 3) return 1000;
  if (rank >= 4 && rank <= 10) return 500;
  if (rank >= 11 && rank <= 50) return 150;
  if (rank >= 51 && rank <= 100) return 50;
  return null;
}

export default function Payout() {
  const { user, profile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [method, setMethod] = useState("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [history, setHistory] = useState<PayoutRequest[]>([]);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  // Load eligibility + history
  useEffect(() => {
    if (!user) return;
    setChecking(true);

    (async () => {
      // Get current contest
      const now = new Date();
      const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
      const m = bdtNow.getMonth() + 1;
      const y = bdtNow.getFullYear();

      const { data: contest } = await supabase
        .from("monthly_contests")
        .select("id")
        .eq("month", m)
        .eq("year", y)
        .maybeSingle();

      if (!contest) {
        setBlockReason("এই মাসে কোনো কনটেস্ট পাওয়া যায়নি।");
        setChecking(false);
        return;
      }

      // Check if user is a winner
      const { data: winner } = await supabase
        .from("monthly_winners")
        .select("final_rank, prize_amount, contest_id")
        .eq("user_id", user.id)
        .eq("contest_id", contest.id)
        .maybeSingle();

      if (!winner) {
        setBlockReason("আপনার র‍্যাঙ্ক ১০০ এর বাইরে, তাই আপনি পেআউট অনুরোধ পাঠাতে পারবেন না।");
        setChecking(false);
      } else if (winner.final_rank > 100) {
        setBlockReason("আপনার র‍্যাঙ্ক ১০০ এর বাইরে, তাই আপনি পেআউট অনুরোধ পাঠাতে পারবেন না।");
        setChecking(false);
      } else {
        const prize = getPrizeByRank(winner.final_rank);
        if (!prize) {
          setBlockReason("আপনার র‍্যাঙ্কের জন্য পুরস্কার পাওয়া যায়নি।");
          setChecking(false);
        } else {
          setWinnerInfo({ final_rank: winner.final_rank, prize_amount: prize, contest_id: contest.id });

          // Check existing requests for this contest
          const { data: existingReqs } = await supabase
            .from("payout_requests")
            .select("id, status, created_at")
            .eq("user_id", user.id)
            .eq("contest_id", contest.id);

          if (existingReqs && existingReqs.length > 0) {
            const hasApprovedOrPaid = existingReqs.some(r => r.status === "approved" || r.status === "paid");
            if (hasApprovedOrPaid) {
              setBlockReason("এই মাসের জন্য আপনার পেআউট অনুরোধ ইতোমধ্যে অনুমোদিত হয়েছে। আপনি পরবর্তী মাসে আবার অনুরোধ পাঠাতে পারবেন।");
              setChecking(false);
            } else {
              const hasPending = existingReqs.some(r => r.status === "pending");
              if (hasPending) {
                setBlockReason("আপনার একটি পেন্ডিং পেআউট অনুরোধ আছে। অনুগ্রহ করে অপেক্ষা করুন।");
                setChecking(false);
              } else {
                setChecking(false);
              }
            }
          } else {
            setChecking(false);
          }

          // 24h cooldown check
          const { data: lastReq } = await supabase
            .from("payout_requests")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastReq) {
            const elapsed = Date.now() - new Date(lastReq.created_at).getTime();
            if (elapsed < 24 * 60 * 60 * 1000) {
              setBlockReason("আপনি ইতোমধ্যে একটি পেআউট অনুরোধ পাঠিয়েছেন। নতুন অনুরোধ পাঠাতে ২৪ ঘণ্টা অপেক্ষা করতে হবে।");
            }
          }
        }
      }

      // Load history
      const { data: historyData } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setHistory((historyData as PayoutRequest[]) || []);
    })();
  }, [user]);

  useEffect(() => {
    if (method === "bkash") setAccountNumber(profile?.bkash_number || "");
    else setAccountNumber(profile?.nagad_number || "");
  }, [method, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !winnerInfo || !accountNumber || blockReason) return;

    setLoading(true);

    const { data, error } = await supabase.functions.invoke("request-payout", {
      body: {
        payment_method: method,
        account_number: accountNumber,
        contest_id: winnerInfo.contest_id,
      },
    });

    if (error || (data && data.error)) {
      toast.error(data?.error || "সাবমিট করতে সমস্যা হয়েছে");
    } else {
      toast.success("পেআউট অনুরোধ জমা হয়েছে!");
      setSubmitted(true);
    }
    setLoading(false);
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "approved": return "অনুমোদিত";
      case "paid": return "পরিশোধিত";
      case "rejected": return "প্রত্যাখ্যাত";
      default: return "পেন্ডিং";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-10 px-4">
          <div className="max-w-sm mx-auto text-center mt-12">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">পেআউট অনুরোধ জমা হয়েছে!</h2>
            <p className="text-sm text-muted-foreground">আমাদের টিম আপনার অনুরোধ পর্যালোচনা করবে। অনুগ্রহ করে ২৪-৪৮ ঘণ্টা অপেক্ষা করুন।</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neon-pink" /> পেআউট অনুরোধ
          </h1>

          {checking ? (
            <div className="text-center py-12 text-muted-foreground">যোগ্যতা যাচাই হচ্ছে...</div>
          ) : blockReason ? (
            <div className="glass-card p-6 rounded-xl text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-sm text-destructive font-medium">{blockReason}</p>
            </div>
          ) : winnerInfo ? (
            <>
              <div className="glass-card p-4 rounded-xl mb-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">আপনি পেআউটের জন্য যোগ্য</p>
                  <p className="font-bold text-foreground">
                    র‍্যাঙ্ক #{winnerInfo.final_rank} — পুরস্কার {formatBDT(winnerInfo.prize_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">আপনার পুরস্কারের পরিমাণ স্বয়ংক্রিয়ভাবে নির্ধারিত হয়েছে</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">পুরস্কারের পরিমাণ (৳)</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`৳${winnerInfo.prize_amount}`}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground opacity-70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">পেমেন্ট মেথড</label>
                  <select
                    required
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{method === "bkash" ? "bKash" : "Nagad"} নম্বর</label>
                  <input
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold disabled:opacity-50"
                >
                  {loading ? "জমা হচ্ছে..." : "পেআউট অনুরোধ জমা দিন"}
                </button>
              </form>
            </>
          ) : null}

          {/* History */}
          {history.length > 0 && (
            <div className="glass-card p-4 rounded-xl mt-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-primary" /> পেআউট হিস্ট্রি
              </h3>
              <div className="space-y-2">
                {history.map(p => (
                  <div key={p.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">৳{p.prize_amount} {p.final_rank ? `(র‍্যাঙ্ক #${p.final_rank})` : ""}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.payment_method === "bkash" ? "bKash" : "Nagad"} • {p.account_number} • {new Date(p.created_at).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === "paid" ? "bg-primary/20 text-primary" :
                      p.status === "approved" ? "bg-accent/20 text-accent" :
                      p.status === "rejected" ? "bg-destructive/20 text-destructive" :
                      "bg-secondary/20 text-secondary"
                    }`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
