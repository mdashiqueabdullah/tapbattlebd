import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Check, Clock, History } from "lucide-react";

interface PayoutRequest {
  id: string;
  prize_amount: number;
  payment_method: string;
  account_number: string;
  status: string;
  created_at: string;
}

export default function Payout() {
  const { user, profile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("bkash");
  const [accountNumber, setAccountNumber] = useState(profile?.bkash_number || "");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<PayoutRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setHistory((data as PayoutRequest[]) || []);
    })();
  }, [user]);

  useEffect(() => {
    if (method === "bkash") setAccountNumber(profile?.bkash_number || "");
    else setAccountNumber(profile?.nagad_number || "");
  }, [method, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !accountNumber) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("সঠিক পরিমাণ দিন");
      return;
    }

    setLoading(true);

    // Get current contest
    const now = new Date();
    const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
    const m = bdtNow.getMonth() + 1;
    const y = bdtNow.getFullYear();

    const { data: contestData } = await supabase
      .from("monthly_contests")
      .select("id")
      .eq("month", m)
      .eq("year", y)
      .single();

    const { error } = await supabase.from("payout_requests").insert({
      user_id: user.id,
      contest_id: contestData?.id || null,
      prize_amount: numAmount,
      payment_method: method,
      account_number: accountNumber,
    });

    if (error) {
      toast.error("সাবমিট করতে সমস্যা হয়েছে");
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
            <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-2 rounded-xl gradient-primary text-primary-foreground font-semibold">
              আরেকটি অনুরোধ পাঠান
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">পরিমাণ (৳)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="পুরস্কারের পরিমাণ"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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

          {/* History */}
          {history.length > 0 && (
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-primary" /> পেআউট হিস্ট্রি
              </h3>
              <div className="space-y-2">
                {history.map(p => (
                  <div key={p.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">৳{p.prize_amount}</p>
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
