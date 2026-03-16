import { Link } from "react-router-dom";
import { CheckCircle, LogIn } from "lucide-react";

export default function EmailVerified() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          ইমেইল ভেরিফাই হয়েছে!
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে। এখন আপনি লগইন করতে পারবেন।
        </p>

        <Link
          to="/login"
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> লগইন করুন
        </Link>
      </div>
    </div>
  );
}
