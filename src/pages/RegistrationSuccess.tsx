import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email;
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      toast.error(error.message || "ইমেইল পাঠানো যায়নি।");
    } else {
      toast.success("ভেরিফিকেশন ইমেইল আবার পাঠানো হয়েছে!");
      setCooldown(60);
    }
    setResending(false);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          অ্যাকাউন্ট তৈরি হয়েছে!
        </h1>

        <p className="text-sm text-muted-foreground mb-2">
          আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। লগইন করার আগে অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।
        </p>

        <div className="glass-card p-4 rounded-xl mb-6">
          <p className="text-sm text-foreground">
            <span className="text-primary font-semibold">{email}</span> এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে।
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
                : "আবার ভেরিফিকেশন ইমেইল পাঠান"
            }
          </button>

          <Link
            to="/login"
            className="w-full py-2.5 rounded-xl glass-card text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 border border-border/50"
          >
            <ArrowLeft className="w-4 h-4" /> লগইন পেজে যান
          </Link>
        </div>

        <div className="mt-8 glass-card p-4 rounded-xl text-left space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> সাহায্য
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• স্প্যাম/জাঙ্ক ফোল্ডার চেক করুন</li>
            <li>• কয়েক মিনিট অপেক্ষা করুন</li>
            <li>• ইমেইল না পেলে "আবার পাঠান" বাটনে ক্লিক করুন</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
