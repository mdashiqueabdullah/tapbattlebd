import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { CheckCircle, LogIn } from "lucide-react";

export default function VerifyEmail() {
  const { user, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  // Handle email verification callback (when user clicks the link)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=signup")) {
      // Supabase will auto-confirm the session from the hash
      // We just need to wait for the auth state to update
      setVerified(true);
    }
  }, []);

  // When user is verified and logged in, register device + complete referral
  useEffect(() => {
    if (user && isEmailVerified) {
      (async () => {
        try {
          const fingerprint = await getDeviceFingerprint();
          await supabase.functions.invoke("register-device", {
            body: { device_fingerprint: fingerprint },
          });
        } catch (e) {
          console.error("Device registration error:", e);
        }

        // Complete referral
        try {
          await supabase.rpc("complete_referral_on_email_confirm", { _user_id: user.id });
        } catch (e) {
          console.error("Referral completion error:", e);
        }
      })();

      // If they just verified, show success briefly then redirect
      if (verified) {
        setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isEmailVerified, navigate, verified]);

  // If verified via link, show success page
  if (verified || (user && isEmailVerified)) {
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
            আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে। ড্যাশবোর্ডে যাচ্ছেন...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in (user clicked link from different browser/session), show success with login link
  if (!user) {
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

  // Fallback loading
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-primary font-display text-xl animate-pulse">ভেরিফাই হচ্ছে...</div>
    </div>
  );
}
