import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Ban } from "lucide-react";

interface GameSession {
  id: string;
  user_id: string;
  session_token: string;
  is_practice: boolean;
  status: string;
  client_score: number;
  verified_score: number | null;
  tap_count: number;
  avg_interval_ms: number;
  interval_variance: number;
  min_interval_ms: number;
  max_interval_ms: number;
  bot_risk_score: number;
  visibility_changes: number;
  focus_losses: number;
  ip_address: string | null;
  user_agent: string | null;
  flagged: boolean;
  flag_reasons: string[];
  review_status: string;
  started_at: string;
  ended_at: string | null;
}

export default function AntiCheatPanel() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [filter, setFilter] = useState<"flagged" | "all" | "approved" | "rejected">("flagged");
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    let query = supabase
      .from("game_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter === "flagged") {
      query = query.eq("flagged", true);
    } else if (filter === "approved") {
      query = query.eq("review_status", "approved");
    } else if (filter === "rejected") {
      query = query.eq("review_status", "rejected");
    }

    const { data, error } = await query;
    if (!error && data) {
      setSessions(data as unknown as GameSession[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const handleReview = async (sessionId: string, action: "approved" | "rejected") => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const { error } = await supabase
      .from("game_sessions")
      .update({
        review_status: action,
        verified_score: action === "approved" ? session.client_score : 0,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq("id", sessionId);

    if (error) {
      toast.error("আপডেট করতে ব্যর্থ");
      return;
    }

    toast.success(action === "approved" ? "অনুমোদিত ✓" : "প্রত্যাখ্যাত ✕");
    fetchSessions();
    setSelectedSession(null);
  };

  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-destructive";
    if (score >= 30) return "text-yellow-500";
    return "text-accent";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 60) return "উচ্চ ঝুঁকি";
    if (score >= 30) return "মাঝারি ঝুঁকি";
    return "নিম্ন ঝুঁকি";
  };

  const flagLabels: Record<string, string> = {
    impossibly_fast_taps: "অসম্ভব দ্রুত ট্যাপ",
    machine_like_consistency: "যন্ত্রসদৃশ ধারাবাহিকতা",
    low_coefficient_of_variation: "কম বৈচিত্র্য",
    excessive_tap_rate: "অতিরিক্ত ট্যাপ হার",
    impossible_score_per_tap: "অসম্ভব স্কোর/ট্যাপ",
    excessive_visibility_changes: "অতিরিক্ত ট্যাব পরিবর্তন",
    session_too_long: "দীর্ঘ সেশন",
    score_mismatch: "স্কোর অমিল",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> অ্যান্টি-চিট প্যানেল
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "ফ্ল্যাগড সেশন", value: sessions.filter(s => s.flagged).length.toString(), color: "text-destructive" },
          { label: "রিভিউ পেন্ডিং", value: sessions.filter(s => s.review_status === "flagged").length.toString(), color: "text-yellow-500" },
          { label: "অনুমোদিত", value: sessions.filter(s => s.review_status === "approved").length.toString(), color: "text-accent" },
          { label: "প্রত্যাখ্যাত", value: sessions.filter(s => s.review_status === "rejected").length.toString(), color: "text-secondary" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(["flagged", "all", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === f ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "flagged" ? "ফ্ল্যাগড" : f === "all" ? "সব" : f === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">কোনো সেশন পাওয়া যায়নি</div>
      ) : (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground text-xs">
                  <th className="text-left p-3">ইউজার</th>
                  <th className="text-center p-3">স্কোর</th>
                  <th className="text-center p-3">ট্যাপ</th>
                  <th className="text-center p-3">ঝুঁকি</th>
                  <th className="text-center p-3">স্ট্যাটাস</th>
                  <th className="text-center p-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id} className="border-b border-border/10 hover:bg-muted/10">
                    <td className="p-3">
                      <p className="text-xs text-muted-foreground font-mono">{session.user_id.slice(0, 8)}...</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(session.started_at).toLocaleDateString("bn-BD")}</p>
                    </td>
                    <td className="text-center p-3">
                      <span className="font-bold text-foreground">{session.client_score}</span>
                      {session.verified_score !== null && session.verified_score !== session.client_score && (
                        <span className="text-xs text-muted-foreground block">যাচাই: {session.verified_score}</span>
                      )}
                    </td>
                    <td className="text-center p-3 text-foreground">{session.tap_count}</td>
                    <td className="text-center p-3">
                      <span className={`font-bold ${getRiskColor(session.bot_risk_score)}`}>
                        {Math.round(session.bot_risk_score)}%
                      </span>
                      <p className={`text-[10px] ${getRiskColor(session.bot_risk_score)}`}>
                        {getRiskLabel(session.bot_risk_score)}
                      </p>
                    </td>
                    <td className="text-center p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        session.review_status === "approved" ? "bg-accent/20 text-accent" :
                        session.review_status === "rejected" ? "bg-destructive/20 text-destructive" :
                        "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {session.review_status === "approved" ? "অনুমোদিত" :
                         session.review_status === "rejected" ? "প্রত্যাখ্যাত" : "ফ্ল্যাগড"}
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {session.review_status !== "approved" && (
                          <button
                            onClick={() => handleReview(session.id, "approved")}
                            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20"
                            title="অনুমোদন করুন"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {session.review_status !== "rejected" && (
                          <button
                            onClick={() => handleReview(session.id, "rejected")}
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                            title="প্রত্যাখ্যান করুন"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="glass-card rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${getRiskColor(selectedSession.bot_risk_score)}`} />
                সেশন বিশ্লেষণ
              </h3>
              <button onClick={() => setSelectedSession(null)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              {/* Risk Score */}
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-1">বট ঝুঁকি স্কোর</p>
                <div className="flex items-center gap-3">
                  <p className={`font-display text-3xl font-bold ${getRiskColor(selectedSession.bot_risk_score)}`}>
                    {Math.round(selectedSession.bot_risk_score)}%
                  </p>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedSession.bot_risk_score >= 60 ? "bg-destructive" :
                          selectedSession.bot_risk_score >= 30 ? "bg-yellow-500" : "bg-accent"
                        }`}
                        style={{ width: `${selectedSession.bot_risk_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {selectedSession.flag_reasons.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">শনাক্ত সমস্যা</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSession.flag_reasons.map((flag, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                        {flagLabels[flag] || flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tap Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ক্লায়েন্ট স্কোর", value: selectedSession.client_score },
                  { label: "যাচাইকৃত স্কোর", value: selectedSession.verified_score ?? "N/A" },
                  { label: "মোট ট্যাপ", value: selectedSession.tap_count },
                  { label: "গড় ইন্টারভাল (ms)", value: Math.round(selectedSession.avg_interval_ms) },
                  { label: "ন্যূনতম ইন্টারভাল (ms)", value: Math.round(selectedSession.min_interval_ms) },
                  { label: "সর্বোচ্চ ইন্টারভাল (ms)", value: Math.round(selectedSession.max_interval_ms) },
                  { label: "ভ্যারিয়ান্স", value: Math.round(selectedSession.interval_variance) },
                  { label: "ভিজিবিলিটি চেঞ্জ", value: selectedSession.visibility_changes },
                  { label: "ফোকাস লস", value: selectedSession.focus_losses },
                ].map((m, i) => (
                  <div key={i} className="glass-card p-3">
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className="font-bold text-foreground text-sm">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Device Info */}
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground mb-2">ডিভাইস তথ্য</p>
                <div className="text-xs space-y-1 text-foreground">
                  <p><span className="text-muted-foreground">IP:</span> {selectedSession.ip_address || "N/A"}</p>
                  <p><span className="text-muted-foreground">স্ক্রিন:</span> {selectedSession.screen_width}×{selectedSession.screen_height}</p>
                  <p className="break-all"><span className="text-muted-foreground">UA:</span> {selectedSession.user_agent?.slice(0, 100) || "N/A"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selectedSession.id, "approved")}
                  className="flex-1 py-2.5 rounded-lg bg-accent/20 text-accent font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-accent/30"
                >
                  <CheckCircle className="w-4 h-4" /> অনুমোদন
                </button>
                <button
                  onClick={() => handleReview(selectedSession.id, "rejected")}
                  className="flex-1 py-2.5 rounded-lg bg-destructive/20 text-destructive font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-destructive/30"
                >
                  <XCircle className="w-4 h-4" /> প্রত্যাখ্যান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
