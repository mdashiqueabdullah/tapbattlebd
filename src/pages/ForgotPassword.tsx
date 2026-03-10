import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("ইমেইল দিন"); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (err) {
      setError("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary neon-text mb-1">
              পাসওয়ার্ড ভুলে গেছেন?
            </h1>
            <p className="text-sm text-muted-foreground">
              আপনার ইমেইল দিন, রিসেট লিংক পাঠানো হবে
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
                যদি এই ইমেইল দিয়ে অ্যাকাউন্ট থাকে, তাহলে একটি রিসেট লিংক পাঠানো হয়েছে। আপনার ইমেইল চেক করুন।
              </div>
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> লগইনে ফিরে যান
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-50"
              >
                {loading ? "অপেক্ষা করুন..." : "রিসেট লিংক পাঠান"}
              </button>
              <Link to="/login" className="block text-center text-sm text-primary hover:underline">
                <span className="inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> লগইনে ফিরে যান</span>
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
