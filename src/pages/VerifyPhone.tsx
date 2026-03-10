import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPhone() {
  const { user, refreshProfile, signOut } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^01[3-9]\d{8}$/)) {
      toast.error("সঠিক বাংলাদেশি ফোন নম্বর দিন (01XXXXXXXXX)");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone_number: phone },
      });
      if (error || data?.error) {
        toast.error(data?.error || error?.message || "OTP পাঠাতে ব্যর্থ");
      } else {
        toast.success("OTP পাঠানো হয়েছে!");
        setStep("otp");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি");
    }
    setSending(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("৬ ডিজিটের OTP কোড দিন");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone_number: phone, otp_code: otp },
      });
      if (error || data?.error) {
        toast.error(data?.error || error?.message || "ভেরিফিকেশন ব্যর্থ");
      } else {
        toast.success("ফোন ভেরিফাই হয়েছে! 🎉");
        await refreshProfile();
      }
    } catch {
      toast.error("সার্ভার ত্রুটি");
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-primary neon-text mb-2">ফোন ভেরিফাই করুন</h1>
        <p className="text-sm text-muted-foreground mb-6">
          গেম খেলতে এবং ড্যাশবোর্ড দেখতে আপনার ফোন নম্বর ভেরিফাই করতে হবে।
        </p>

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="01XXXXXXXXX"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
            >
              {sending ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{phone}</span> নম্বরে OTP পাঠানো হয়েছে
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="৬ ডিজিট কোড"
              className="w-full text-center py-3 rounded-xl bg-muted border border-border text-foreground text-2xl tracking-[0.5em] font-display focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
            >
              {verifying ? "ভেরিফাই হচ্ছে..." : "ভেরিফাই করুন"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              নম্বর পরিবর্তন করুন
            </button>
          </form>
        )}

        <button
          onClick={signOut}
          className="mt-6 text-xs text-muted-foreground hover:text-foreground"
        >
          লগআউট
        </button>
      </div>
    </div>
  );
}
