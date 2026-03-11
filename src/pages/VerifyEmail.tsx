import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { Mail, RefreshCw, LogOut, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { user, isEmailVerified, signOut, resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // If email is verified, register device and redirect
  useEffect(() => {
    if (isEmailVerified) {
      // Register device + complete referral
      (async () => {
        try {
          const fingerprint = await getDeviceFingerprint();
          await supabase.functions.invoke("register-device", {
            body: { device_fingerprint: fingerprint },
          });
        } catch (e) {
          console.error("Device registration error:", e);
        }
      })();
      navigate("/dashboard", { replace: true });
    }
  }, [isEmailVerified, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Periodically check if email was verified
  useEffect(() => {
    if (!user || isEmailVerified) return;
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        window.location.reload();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, isEmailVerified]);

  const handleResend = async () => {
    setResending(true);
    const { error } = await resendVerificationEmail();
    if (error) {
      toast.error(error);
    } else {
      toast.success("ভেরিফিকেশন ইমেইল আবার পাঠানো হয়েছে!");
      setCooldown(60);
    }
    setResending(false);
  };

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          ইমেইল ভেরিফাই করুন
        </h1>
        
        <p className="text-sm text-muted-foreground mb-2">
          আপনার অ্যাকাউন্ট ব্যবহার করার আগে ইমেইল ভেরিফাই করুন।
        </p>
        
        <div className="glass-card p-4 rounded-xl mb-6">
          <p className="text-sm text-foreground">
            <span className="text-primary font-semibold">{user.email}</span> এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে।
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করুন।
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {cooldown > 0 
              ? `আবার পাঠাতে ${cooldown}s অপেক্ষা করুন` 
              : resending 
                ? "পাঠানো হচ্ছে..." 
                : "আবার ইমেইল পাঠান"
            }
          </button>

          <button
            onClick={signOut}
            className="w-full py-2.5 rounded-xl glass-card text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 border border-border/50"
          >
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>

        <div className="mt-8 glass-card p-4 rounded-xl text-left space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" /> সাহায্য
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• স্প্যাম/জাঙ্ক ফোল্ডার চেক করুন</li>
            <li>• কয়েক মিনিট অপেক্ষা করুন</li>
            <li>• ইমেইল না পেলে আবার পাঠান বাটনে ক্লিক করুন</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
