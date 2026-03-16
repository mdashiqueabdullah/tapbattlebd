import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, Phone, Gift } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === "/register");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user, isEmailVerified } = useAuth();

  const referralFromUrl = searchParams.get("ref") || "";

  useEffect(() => {
    if (referralFromUrl) setReferralInput(referralFromUrl);
  }, [referralFromUrl]);

  useEffect(() => {
    setIsRegister(location.pathname === "/register");
  }, [location.pathname]);

  useEffect(() => {
    if (user && isEmailVerified) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isEmailVerified, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !agreed) {
      toast.error("শর্তাবলী মেনে নিন");
      return;
    }
    if (isRegister && username.length < 3) {
      toast.error("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে");
      return;
    }

    if (isRegister && isDisposableEmail(email)) {
      toast.error("টেম্পোরারি/ডিসপোজেবল ইমেইল ব্যবহার করা যাবে না।");
      return;
    }

    // Validate referral code if provided
    if (isRegister && referralInput.trim()) {
      const { data: refProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralInput.trim().toUpperCase())
        .maybeSingle();

      if (!refProfile) {
        toast.error("রেফারেল কোড সঠিক নয়।");
        return;
      }
    }

    setLoading(true);

    if (isRegister) {
      try {
        const fingerprint = await getDeviceFingerprint();
        const { data: deviceCheck } = await supabase.functions.invoke("check-device", {
          body: { device_fingerprint: fingerprint, email },
        });

        if (deviceCheck && !deviceCheck.allowed) {
          toast.error(deviceCheck.error || "এই ডিভাইস থেকে শুধুমাত্র একটি অ্যাকাউন্ট তৈরি করা যাবে।");
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Device check failed:", e);
      }

      const { error } = await signUp(email, password, username, phoneNumber || undefined, referralInput.trim().toUpperCase() || undefined);
      if (error) {
        toast.error(error);
      } else {
        // Sign out immediately - user must verify email before logging in
        await supabase.auth.signOut();
        navigate("/registration-success", { state: { email }, replace: true });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.includes("Email not confirmed")) {
          navigate("/email-not-verified", { state: { email } });
        } else {
          toast.error(error);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary neon-text mb-1">
              {isRegister ? t("signUp") : t("login")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRegister ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "আপনার অ্যাকাউন্টে লগইন করুন"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ইউজারনেম"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ইমেইল"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isRegister && (
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="ফোন নম্বর (ঐচ্ছিক)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {isRegister && (
              <div className="relative">
                <Gift className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={referralInput}
                  onChange={e => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="রেফারেল কোড (ঐচ্ছিক)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={8}
                />
              </div>
            )}

            {isRegister && (
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 rounded border-border" />
                <span>আমি <Link to="/terms" className="text-primary underline">শর্তাবলী</Link> এবং <Link to="/privacy" className="text-primary underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছি</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
            >
              {loading ? "অপেক্ষা করুন..." : isRegister ? t("signUp") : t("login")}
            </button>

            {!isRegister && (
              <Link to="/forgot-password" className="block text-center text-sm text-primary hover:underline">
                {t("forgotPassword")}
              </Link>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-muted-foreground"
            >
              {isRegister ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "অ্যাকাউন্ট নেই? "}
              <span className="text-primary font-semibold">{isRegister ? t("login") : t("signUp")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
