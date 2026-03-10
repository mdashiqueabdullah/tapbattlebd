import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { History, Clock, CheckCircle, XCircle } from "lucide-react";

interface Purchase {
  id: string;
  payment_method: string;
  transaction_id: string;
  amount: number;
  attempts_count: number;
  status: string;
  created_at: string;
}

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("attempt_purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setPurchases((data as Purchase[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const statusIcon = (s: string) => {
    switch (s) {
      case "approved": return <CheckCircle className="w-4 h-4 text-primary" />;
      case "rejected": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-accent" />;
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "approved": return "অনুমোদিত";
      case "rejected": return "প্রত্যাখ্যাত";
      default: return "পেন্ডিং";
    }
  };

  if (loading) return null;
  if (purchases.length === 0) return null;

  return (
    <div className="glass-card p-4 rounded-xl">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-primary" /> পার্চেজ হিস্ট্রি
      </h3>
      <div className="space-y-2">
        {purchases.map(p => (
          <div key={p.id} className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">
                {p.attempts_count}টি অ্যাটেম্পট – ৳{p.amount}
              </p>
              <div className="flex items-center gap-1.5">
                {statusIcon(p.status)}
                <span className={`text-xs font-medium ${
                  p.status === "approved" ? "text-primary" : p.status === "rejected" ? "text-destructive" : "text-accent"
                }`}>
                  {statusLabel(p.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {p.payment_method === "bkash" ? "bKash" : "Nagad"} • {new Date(p.created_at).toLocaleDateString("bn-BD")}
              </p>
              <p className="text-xs text-muted-foreground font-mono">{p.transaction_id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
