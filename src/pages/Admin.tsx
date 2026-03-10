import { useState, useEffect } from "react";
import { Shield, Users, Trophy, CreditCard, BarChart3, AlertTriangle, Download, Megaphone, Share2, ShoppingCart, CheckCircle, XCircle, Award, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AntiCheatPanel from "@/components/AntiCheatPanel";

const tabs = [
  { key: "overview", label: "ওভারভিউ", icon: BarChart3 },
  { key: "users", label: "ইউজার", icon: Users },
  { key: "leaderboard", label: "লিডারবোর্ড", icon: Trophy },
  { key: "anticheat", label: "অ্যান্টি-চিট", icon: Shield },
  { key: "payouts", label: "পেআউট", icon: CreditCard },
  { key: "purchases", label: "পার্চেজ", icon: ShoppingCart },
  { key: "referrals", label: "রেফারেল", icon: Share2 },
  { key: "winners", label: "বিজয়ী", icon: Award },
];

interface UserRow { id: string; username: string; email: string | null; total_ranked_games: number; is_banned: boolean; referral_points: number; created_at: string; }
interface PurchaseRow { id: string; user_id: string; payment_method: string; transaction_id: string; amount: number; attempts_count: number; status: string; created_at: string; username?: string; }
interface PayoutRow { id: string; user_id: string; prize_amount: number; payment_method: string; account_number: string; status: string; created_at: string; username?: string; }
interface LeaderboardRow { user_id: string; attempt_total_score: number; referral_points: number; daily_streak_points: number; total_score: number; attempts_used: number; username?: string; }
interface ReferralRow { id: string; referrer_user_id: string; referred_user_id: string; points_awarded: number; status: string; created_at: string; referrer_name?: string; referred_name?: string; }

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Data states
  const [users, setUsers] = useState<UserRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [purchaseFilter, setPurchaseFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [payoutFilter, setPayoutFilter] = useState<"pending" | "approved" | "paid" | "rejected" | "all">("pending");
  const [stats, setStats] = useState({ totalUsers: 0, todayGames: 0, pendingPayouts: 0, pendingPurchases: 0 });
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<any[]>([]);
  const [finalizingWinners, setFinalizingWinners] = useState(false);

  // Check admin
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  // Fetch overview stats
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { count: uc } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const today = new Date().toISOString().split("T")[0];
      const { count: gc } = await supabase.from("game_sessions").select("*", { count: "exact", head: true }).gte("created_at", today);
      const { count: pp } = await supabase.from("payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: pc } = await supabase.from("attempt_purchases").select("*", { count: "exact", head: true }).eq("status", "pending");
      setStats({ totalUsers: uc ?? 0, todayGames: gc ?? 0, pendingPayouts: pp ?? 0, pendingPurchases: pc ?? 0 });
      setLoading(false);
    })();
  }, [isAdmin]);

  // Fetch users
  useEffect(() => {
    if (activeTab !== "users" || !isAdmin) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id, username, email, total_ranked_games, is_banned, referral_points, created_at").order("created_at", { ascending: false }).limit(200);
      setUsers((data as UserRow[]) || []);
    })();
  }, [activeTab, isAdmin]);

  // Fetch purchases
  useEffect(() => {
    if (activeTab !== "purchases" || !isAdmin) return;
    (async () => {
      let q = supabase.from("attempt_purchases").select("*").order("created_at", { ascending: false }).limit(100);
      if (purchaseFilter !== "all") q = q.eq("status", purchaseFilter);
      const { data } = await q;
      if (data) {
        const uids = [...new Set(data.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
        const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
        setPurchases(data.map((p: any) => ({ ...p, username: m.get(p.user_id) || p.user_id.slice(0, 8) })));
      }
    })();
  }, [activeTab, purchaseFilter, isAdmin]);

  // Fetch payouts
  useEffect(() => {
    if (activeTab !== "payouts" || !isAdmin) return;
    (async () => {
      let q = supabase.from("payout_requests").select("*").order("created_at", { ascending: false }).limit(100);
      if (payoutFilter !== "all") q = q.eq("status", payoutFilter);
      const { data } = await q;
      if (data) {
        const uids = [...new Set(data.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
        const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
        setPayouts(data.map((p: any) => ({ ...p, username: m.get(p.user_id) || p.user_id.slice(0, 8) })));
      }
    })();
  }, [activeTab, payoutFilter, isAdmin]);

  // Fetch leaderboard
  useEffect(() => {
    if (activeTab !== "leaderboard" || !isAdmin) return;
    (async () => {
      const now = new Date();
      const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
      const { data: cd } = await supabase.from("monthly_contests").select("id").eq("month", bdtNow.getMonth() + 1).eq("year", bdtNow.getFullYear()).single();
      if (!cd) return;
      const { data } = await supabase.from("leaderboard").select("*").eq("contest_id", cd.id).order("total_score", { ascending: false }).limit(50);
      if (data) {
        const uids = data.map((e: any) => e.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
        const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
        setLeaderboard(data.map((e: any) => ({ ...e, username: m.get(e.user_id) || "Unknown" })));
      }
    })();
  }, [activeTab, isAdmin]);

  // Fetch referrals
  useEffect(() => {
    if (activeTab !== "referrals" || !isAdmin) return;
    (async () => {
      const { data } = await supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(100);
      if (data) {
        const uids = [...new Set(data.flatMap((r: any) => [r.referrer_user_id, r.referred_user_id]))];
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
        const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
        setReferrals(data.map((r: any) => ({ ...r, referrer_name: m.get(r.referrer_user_id) || "?", referred_name: m.get(r.referred_user_id) || "?" })));
      }
    })();
  }, [activeTab, isAdmin]);

  // Fetch winners
  useEffect(() => {
    if (activeTab !== "winners" || !isAdmin) return;
    (async () => {
      const { data } = await supabase.from("monthly_winners").select("*").order("final_rank", { ascending: true }).limit(100);
      if (data) {
        const uids = [...new Set(data.map((w: any) => w.user_id))];
        if (uids.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
          const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
          setWinners(data.map((w: any) => ({ ...w, username: m.get(w.user_id) || "Unknown" })));
        } else {
          setWinners([]);
        }
      }
    })();
  }, [activeTab, isAdmin]);

  const handlePurchaseAction = async (id: string, action: "approved" | "rejected", userId: string, attempts: number) => {
    if (!user) return;
    const { error } = await supabase.from("attempt_purchases").update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString() } as any).eq("id", id);
    if (error) { toast.error("আপডেট ব্যর্থ"); return; }
    if (action === "approved") {
      const { data: pd } = await supabase.from("profiles").select("extra_attempts").eq("id", userId).single();
      await supabase.from("profiles").update({ extra_attempts: ((pd as any)?.extra_attempts ?? 0) + attempts } as any).eq("id", userId);
    }
    toast.success(action === "approved" ? "অনুমোদিত ✓" : "প্রত্যাখ্যাত ✕");
    setPurchaseFilter(purchaseFilter); // refetch
  };

  const handlePayoutAction = async (id: string, action: "approved" | "paid" | "rejected") => {
    if (!user) return;
    const { error } = await supabase.from("payout_requests").update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("আপডেট ব্যর্থ"); return; }
    toast.success(action === "approved" ? "অনুমোদিত ✓" : action === "paid" ? "পরিশোধিত ✓" : "প্রত্যাখ্যাত ✕");
    setPayoutFilter(payoutFilter);
  };

  const getPrizeAmount = (rank: number): number => {
    if (rank === 1) return 3000;
    if (rank === 2) return 2000;
    if (rank === 3) return 1000;
    if (rank >= 4 && rank <= 10) return 500;
    if (rank >= 11 && rank <= 50) return 150;
    if (rank >= 51 && rank <= 100) return 50;
    return 0;
  };

  const handleFinalizeWinners = async () => {
    if (!user) return;
    const confirmed = window.confirm("আপনি কি নিশ্চিত? এটি বর্তমান মাসের লিডারবোর্ড থেকে শীর্ষ ১০০ জনকে বিজয়ী হিসেবে নির্ধারণ করবে।");
    if (!confirmed) return;

    setFinalizingWinners(true);
    try {
      const now = new Date();
      const bdtNow = new Date(now.getTime() + (6 * 60 - now.getTimezoneOffset()) * 60000);
      const { data: cd } = await supabase.from("monthly_contests").select("id").eq("month", bdtNow.getMonth() + 1).eq("year", bdtNow.getFullYear()).single();
      if (!cd) { toast.error("বর্তমান মাসের কনটেস্ট পাওয়া যায়নি"); setFinalizingWinners(false); return; }

      // Check if winners already exist for this contest
      const { count } = await supabase.from("monthly_winners").select("*", { count: "exact", head: true }).eq("contest_id", cd.id);
      if ((count ?? 0) > 0) { toast.error("এই মাসের বিজয়ী ইতোমধ্যে নির্ধারিত হয়েছে!"); setFinalizingWinners(false); return; }

      // Get top 100 from leaderboard
      const { data: top100 } = await supabase.from("leaderboard").select("user_id, total_score").eq("contest_id", cd.id).order("total_score", { ascending: false }).limit(100);
      if (!top100 || top100.length === 0) { toast.error("লিডারবোর্ডে কোনো এন্ট্রি নেই"); setFinalizingWinners(false); return; }

      const winnersToInsert = top100.map((entry: any, i: number) => ({
        contest_id: cd.id,
        user_id: entry.user_id,
        final_rank: i + 1,
        prize_amount: getPrizeAmount(i + 1),
      }));

      const { error } = await supabase.from("monthly_winners").insert(winnersToInsert);
      if (error) { toast.error("বিজয়ী সংরক্ষণ ব্যর্থ: " + error.message); setFinalizingWinners(false); return; }

      // Mark contest as finalized
      await supabase.from("monthly_contests").update({ status: "finalized" }).eq("id", cd.id);

      toast.success(`${winnersToInsert.length} জন বিজয়ী সফলভাবে নির্ধারিত হয়েছে!`);
      // Refresh winners list
      const { data: refreshed } = await supabase.from("monthly_winners").select("*").eq("contest_id", cd.id).order("final_rank", { ascending: true });
      if (refreshed) {
        const uids = refreshed.map((w: any) => w.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", uids);
        const m = new Map((profiles || []).map((p: any) => [p.id, p.username]));
        setWinners(refreshed.map((w: any) => ({ ...w, username: m.get(w.user_id) || "Unknown" })));
      }
    } catch (e) {
      toast.error("একটি ত্রুটি ঘটেছে");
    }
    setFinalizingWinners(false);
  };

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    await supabase.from("profiles").update({ is_banned: !currentBanned } as any).eq("id", userId);
    toast.success(!currentBanned ? "ব্যান করা হয়েছে" : "আনব্যান করা হয়েছে");
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentBanned } : u));
  };

  if (isAdmin === null) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse">লোড হচ্ছে...</div></div>;
  if (!isAdmin) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-destructive font-bold">অ্যাক্সেস নেই — শুধু অ্যাডমিনদের জন্য</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 min-h-screen glass-card border-r border-border/30 p-4 hidden md:block">
          <div className="flex items-center gap-2 mb-6"><Shield className="w-5 h-5 text-primary" /><span className="font-display text-sm font-bold text-primary">ADMIN</span></div>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/30 flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex-1 py-3 flex flex-col items-center gap-1 text-[10px] min-w-[50px] ${activeTab === tab.key ? "text-primary" : "text-muted-foreground"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">অ্যাডমিন ড্যাশবোর্ড</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "মোট ইউজার", value: stats.totalUsers.toLocaleString(), color: "text-primary" },
                  { label: "আজকের খেলা", value: stats.todayGames.toLocaleString(), color: "text-secondary" },
                  { label: "পেন্ডিং পেআউট", value: stats.pendingPayouts.toLocaleString(), color: "text-neon-pink" },
                  { label: "পেন্ডিং পার্চেজ", value: stats.pendingPurchases.toLocaleString(), color: "text-accent" },
                ].map((s, i) => (
                  <div key={i} className="glass-card p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">ইউজার ম্যানেজমেন্ট ({users.length})</h2>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left p-3">ইউজারনেম</th><th className="text-left p-3">ইমেইল</th><th className="text-right p-3">খেলা</th><th className="text-right p-3">রেফার</th><th className="text-right p-3">স্ট্যাটাস</th><th className="text-right p-3">অ্যাকশন</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/20">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="p-3 text-foreground font-medium">{u.username}</td>
                          <td className="p-3 text-muted-foreground text-xs">{u.email || "—"}</td>
                          <td className="p-3 text-right text-foreground">{u.total_ranked_games}</td>
                          <td className="p-3 text-right text-accent">{u.referral_points}</td>
                          <td className="p-3 text-right"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_banned ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{u.is_banned ? "ব্যান" : "সক্রিয়"}</span></td>
                          <td className="p-3 text-right"><button onClick={() => handleBanToggle(u.id, u.is_banned)} className="text-xs text-destructive hover:underline">{u.is_banned ? "আনব্যান" : "ব্যান"}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">লিডারবোর্ড</h2>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left p-3">#</th><th className="text-left p-3">ইউজার</th><th className="text-right p-3">অ্যাটেম্পট</th><th className="text-right p-3">রেফার</th><th className="text-right p-3">স্ট্রিক</th><th className="text-right p-3">মোট</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/20">
                      {leaderboard.map((u, i) => (
                        <tr key={u.user_id}>
                          <td className="p-3 font-display font-bold text-accent">{i + 1}</td>
                          <td className="p-3 text-foreground font-medium">{u.username}</td>
                          <td className="p-3 text-right text-primary">{u.attempt_total_score}</td>
                          <td className="p-3 text-right text-neon-pink">{u.referral_points}</td>
                          <td className="p-3 text-right text-accent">{u.daily_streak_points}</td>
                          <td className="p-3 text-right font-display font-bold text-foreground">{u.total_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "anticheat" && <AntiCheatPanel />}

          {activeTab === "purchases" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">পার্চেজ ম্যানেজমেন্ট</h2>
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["pending", "approved", "rejected", "all"] as const).map(f => (
                  <button key={f} onClick={() => setPurchaseFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${purchaseFilter === f ? "gradient-primary text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                    {f === "pending" ? "পেন্ডিং" : f === "approved" ? "অনুমোদিত" : f === "rejected" ? "প্রত্যাখ্যাত" : "সব"}
                  </button>
                ))}
              </div>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">কোনো পার্চেজ নেই</div>
              ) : (
                <div className="glass-card overflow-hidden rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">ইউজার</th><th className="text-left p-3">মেথড</th><th className="text-left p-3">TXN ID</th><th className="text-right p-3">অ্যাটেম্পট</th><th className="text-right p-3">৳</th><th className="text-right p-3">অ্যাকশন</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/20">
                        {purchases.map(p => (
                          <tr key={p.id}>
                            <td className="p-3 text-foreground font-medium text-xs">{p.username}</td>
                            <td className="p-3 text-muted-foreground">{p.payment_method === "bkash" ? "bKash" : "Nagad"}</td>
                            <td className="p-3 text-muted-foreground font-mono text-xs">{p.transaction_id}</td>
                            <td className="p-3 text-right text-foreground">{p.attempts_count}টি</td>
                            <td className="p-3 text-right font-display text-accent">৳{p.amount}</td>
                            <td className="p-3 text-right space-x-2">
                              {p.status === "pending" ? (
                                <>
                                  <button onClick={() => handlePurchaseAction(p.id, "approved", p.user_id, p.attempts_count)} className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> অনুমোদন</button>
                                  <button onClick={() => handlePurchaseAction(p.id, "rejected", p.user_id, p.attempts_count)} className="text-xs text-destructive hover:underline inline-flex items-center gap-0.5"><XCircle className="w-3 h-3" /> প্রত্যাখ্যান</button>
                                </>
                              ) : (
                                <span className={`text-xs font-medium ${p.status === "approved" ? "text-primary" : "text-destructive"}`}>{p.status === "approved" ? "✓ অনুমোদিত" : "✕ প্রত্যাখ্যাত"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "payouts" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">পেআউট ম্যানেজমেন্ট</h2>
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["pending", "approved", "paid", "rejected", "all"] as const).map(f => (
                  <button key={f} onClick={() => setPayoutFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${payoutFilter === f ? "gradient-primary text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                    {f === "pending" ? "পেন্ডিং" : f === "approved" ? "অনুমোদিত" : f === "paid" ? "পরিশোধিত" : f === "rejected" ? "প্রত্যাখ্যাত" : "সব"}
                  </button>
                ))}
              </div>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">কোনো পেআউট অনুরোধ নেই</div>
              ) : (
                <div className="glass-card overflow-hidden rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">ইউজার</th><th className="text-right p-3">৳</th><th className="text-left p-3">মেথড</th><th className="text-left p-3">নম্বর</th><th className="text-right p-3">অ্যাকশন</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/20">
                        {payouts.map(p => (
                          <tr key={p.id}>
                            <td className="p-3 text-foreground font-medium">{p.username}</td>
                            <td className="p-3 text-right font-display text-accent">৳{p.prize_amount}</td>
                            <td className="p-3 text-muted-foreground">{p.payment_method === "bkash" ? "bKash" : "Nagad"}</td>
                            <td className="p-3 text-muted-foreground">{p.account_number}</td>
                            <td className="p-3 text-right space-x-2">
                              {p.status === "pending" && (
                                <>
                                  <button onClick={() => handlePayoutAction(p.id, "approved")} className="text-xs text-primary hover:underline">অনুমোদন</button>
                                  <button onClick={() => handlePayoutAction(p.id, "rejected")} className="text-xs text-destructive hover:underline">প্রত্যাখ্যান</button>
                                </>
                              )}
                              {p.status === "approved" && <button onClick={() => handlePayoutAction(p.id, "paid")} className="text-xs text-primary hover:underline">পরিশোধিত</button>}
                              {p.status === "paid" && <span className="text-xs text-primary">✓ পরিশোধিত</span>}
                              {p.status === "rejected" && <span className="text-xs text-destructive">✕ প্রত্যাখ্যাত</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "referrals" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">রেফারেল ({referrals.length})</h2>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left p-3">রেফারার</th><th className="text-left p-3">রেফার্ড</th><th className="text-right p-3">পয়েন্ট</th><th className="text-right p-3">স্ট্যাটাস</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/20">
                      {referrals.map(r => (
                        <tr key={r.id}>
                          <td className="p-3 text-foreground font-medium">{r.referrer_name}</td>
                          <td className="p-3 text-muted-foreground">{r.referred_name}</td>
                          <td className="p-3 text-right font-display text-accent">{r.points_awarded}</td>
                          <td className="p-3 text-right"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>{r.status === "completed" ? "সম্পন্ন" : "পেন্ডিং"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "winners" && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-bold text-foreground">বিজয়ী ম্যানেজমেন্ট</h2>
                <button
                  onClick={handleFinalizeWinners}
                  disabled={finalizingWinners}
                  className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {finalizingWinners ? "প্রসেসিং..." : "বিজয়ী নির্ধারণ করুন (শীর্ষ ১০০)"}
                </button>
              </div>
              {winners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground glass-card rounded-xl">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>এখনও বিজয়ী নির্ধারণ করা হয়নি।</p>
                  <p className="text-xs mt-1">লিডারবোর্ড থেকে শীর্ষ ১০০ জনকে বিজয়ী হিসেবে নির্ধারণ করতে উপরের বাটনে ক্লিক করুন।</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">র‍্যাঙ্ক</th><th className="text-left p-3">ইউজার</th><th className="text-right p-3">পুরস্কার (৳)</th><th className="text-right p-3">পেআউট স্ট্যাটাস</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/20">
                        {winners.map((w: any) => (
                          <tr key={w.id}>
                            <td className="p-3 font-display font-bold text-accent">#{w.final_rank}</td>
                            <td className="p-3 text-foreground font-medium">{w.username}</td>
                            <td className="p-3 text-right font-display text-primary">৳{w.prize_amount}</td>
                            <td className="p-3 text-right">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${w.payout_status === "paid" ? "bg-primary/20 text-primary" : w.payout_status === "pending" ? "bg-secondary/20 text-secondary" : "bg-accent/20 text-accent"}`}>
                                {w.payout_status === "paid" ? "পরিশোধিত" : w.payout_status === "pending" ? "পেন্ডিং" : w.payout_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
