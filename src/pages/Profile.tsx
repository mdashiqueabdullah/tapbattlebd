import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, CreditCard, Calendar, Target, Trophy, Gamepad2, Edit3, Save } from "lucide-react";

export default function Profile() {
  const { profile, refreshProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phoneNum, setPhoneNum] = useState(profile?.phone_number || "");
  const [bkash, setBkash] = useState(profile?.bkash_number || "");
  const [nagad, setNagad] = useState(profile?.nagad_number || "");
  const [saving, setSaving] = useState(false);
  const [totalPrizeWon, setTotalPrizeWon] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("monthly_winners")
      .select("prize_amount")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const total = (data || []).reduce((sum, w) => sum + Number(w.prize_amount || 0), 0);
        setTotalPrizeWon(total);
      });
  }, [user]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-display text-xl animate-pulse">লোড হচ্ছে...</div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        bkash_number: bkash || null,
        nagad_number: nagad || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    } else {
      toast.success("প্রোফাইল আপডেট হয়েছে!");
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> প্রোফাইল
          </h1>

          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary-foreground">
                  {profile.username[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">{profile.username}</h2>
                <p className="text-sm text-muted-foreground">{profile.full_name || "নাম সেট করুন"}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> যোগদান: {joinDate}
                </p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">পূর্ণ নাম</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">bKash নম্বর</label>
                  <input value={bkash} onChange={e => setBkash(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nagad নম্বর</label>
                  <input value={nagad} onChange={e => setNagad(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl glass-card text-muted-foreground font-medium text-sm">বাতিল</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? "..." : "সেভ করুন"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">ইমেইল</span>
                  <span className="text-foreground">{profile.email || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">মোবাইল</span>
                  <span className="text-foreground">{profile.phone_number || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">bKash</span>
                  <span className="text-foreground">{profile.bkash_number || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Nagad</span>
                  <span className="text-foreground">{profile.nagad_number || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">রেফার কোড</span>
                  <span className="text-primary font-mono font-bold">{profile.referral_code}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <h3 className="font-bold text-foreground mb-3">গেম পরিসংখ্যান</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Gamepad2, label: "র‍্যাঙ্কড খেলা", value: profile.total_ranked_games, color: "text-primary" },
              { icon: Target, label: "প্র্যাকটিস", value: profile.total_practice_games, color: "text-secondary" },
              { icon: Trophy, label: "সেরা স্কোর", value: profile.lifetime_best_score, color: "text-accent" },
              { icon: CreditCard, label: "মোট জয়", value: `${totalPrizeWon}৳`, color: "text-neon-pink" },
            ].map((s, i) => (
              <div key={i} className="glass-card p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {!editing && (
            <button
              onClick={() => {
                setFullName(profile.full_name || "");
                setBkash(profile.bkash_number || "");
                setNagad(profile.nagad_number || "");
                setEditing(true);
              }}
              className="w-full mt-6 py-3 rounded-xl glass-card text-foreground font-semibold border border-border/50 flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> প্রোফাইল সম্পাদনা করুন
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
