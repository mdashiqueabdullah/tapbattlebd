import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, Check, Users, Gift } from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_user_id: string;
  phone_verified: boolean;
  points_awarded: number;
  status: string;
  created_at: string;
  referred_username?: string;
}

export default function ReferralSection() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code}`;

  useEffect(() => {
    if (!profile) return;
    const fetchReferrals = async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", profile.id)
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch referred usernames
        const userIds = data.map((r: any) => r.referred_user_id);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds);
          const usernameMap = new Map((profiles || []).map((p: any) => [p.id, p.username]));
          setReferrals(data.map((r: any) => ({ ...r, referred_username: usernameMap.get(r.referred_user_id) || "Unknown" })));
        } else {
          setReferrals([]);
        }
      }
    };
    fetchReferrals();
  }, [profile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("লিংক কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Tap Battle BD তে আমার রেফার লিংক দিয়ে জয়েন করো! প্রতি মাসে ৳১৫,০০০ জিতুন! ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
  };

  const totalPoints = profile?.referral_points ?? 0;
  const completedReferrals = referrals.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">মোট রেফার</p>
          <p className="font-display text-2xl font-bold text-primary">{completedReferrals}</p>
        </div>
        <div className="glass-card p-4">
          <Gift className="w-5 h-5 text-accent mb-2" />
          <p className="text-xs text-muted-foreground">মোট রেফার পয়েন্ট</p>
          <p className="font-display text-2xl font-bold text-accent">{totalPoints}</p>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="glass-card p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">আমার রেফার কোড</p>
          <p className="font-display text-lg font-bold text-primary tracking-widest">{profile?.referral_code}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">আমার রেফার লিংক</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex-1 py-2.5 rounded-lg bg-[#25D366]/20 text-[#25D366] text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
          <button
            onClick={shareFacebook}
            className="flex-1 py-2.5 rounded-lg bg-[#1877F2]/20 text-[#1877F2] text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Facebook
          </button>
        </div>
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="px-4 py-2 text-xs text-muted-foreground font-medium bg-muted/30 flex">
            <span className="flex-1">ইউজার</span>
            <span className="w-20 text-center">ভেরিফাইড</span>
            <span className="w-16 text-right">পয়েন্ট</span>
          </div>
          <div className="divide-y divide-border/20">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center px-4 py-3 text-sm">
                <div className="flex-1">
                  <p className="text-foreground font-medium">{r.referred_username}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
                </div>
                <span className={`w-20 text-center text-xs px-2 py-0.5 rounded-full ${r.phone_verified ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                  {r.phone_verified ? "✓ হ্যাঁ" : "অপেক্ষমাণ"}
                </span>
                <span className="w-16 text-right font-display font-bold text-accent">{r.points_awarded}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="glass-card p-6 text-center">
          <p className="text-muted-foreground text-sm">এখনো কোনো রেফার নেই। বন্ধুদের আমন্ত্রণ করুন!</p>
        </div>
      )}

      {/* Referral Rules Preview */}
      <div className="glass-card p-4 space-y-2">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" /> রেফার নিয়মাবলী
        </h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-1.5"><span className="text-primary">✓</span> প্রতি সফল রেফারে ২০ পয়েন্ট</li>
          <li className="flex items-start gap-1.5"><span className="text-primary">✓</span> রেফার পয়েন্ট গেম স্কোরের সাথে যোগ হয়</li>
          <li className="flex items-start gap-1.5"><span className="text-primary">✓</span> লিডারবোর্ডে মোট স্কোর = গেম + রেফার</li>
          <li className="flex items-start gap-1.5"><span className="text-primary">✓</span> রেফার্ড ইউজারকে ফোন ভেরিফাই করতে হবে</li>
          <li className="flex items-start gap-1.5"><span className="text-destructive">✗</span> অসম্পূর্ণ অ্যাকাউন্ট গণনা হবে না</li>
        </ul>
        <Link
          to="/referral-rules"
          className="block text-center text-sm text-primary font-semibold hover:underline pt-2"
        >
          সম্পূর্ণ রেফার রুলস দেখুন →
        </Link>
      </div>
    </div>
  );
}
