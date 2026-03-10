import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPw, setShowPw] = useState(false);

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

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ইউজারনেম"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="ইমেইল"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="পাসওয়ার্ড"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isRegister && (
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-1 rounded border-border" />
                <span>আমি <Link to="/terms" className="text-primary underline">শর্তাবলী</Link> এবং <Link to="/privacy" className="text-primary underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছি</span>
              </label>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg"
            >
              {isRegister ? t("signUp") : t("login")}
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
