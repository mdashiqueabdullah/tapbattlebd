import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();

  const referralCode = searchParams.get("ref") || "";

  // If route is /register, default to register mode
  useEffect(() => {
    if (window.location.pathname === "/register") setIsRegister(true);
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

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
    setLoading(true);

    if (isRegister) {
      const { error } = await signUp(email, password, username, referralCode || undefined);
      if (error) {
        toast.error(error);
      } else {
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
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
            {referralCode && isRegister && (
              <p className="text-xs text-primary mt-2">রেফার কোড: <span className="font-bold">{referralCode}</span></p>
            )}
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
