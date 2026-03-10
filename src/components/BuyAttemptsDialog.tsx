import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, CreditCard, CheckCircle, Loader2, AlertTriangle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BuyAttemptsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PACKAGES = [
  { attempts: 5, price: 30, label: "৫টি অ্যাটেম্পট", priceLabel: "৩০৳" },
  { attempts: 10, price: 50, label: "১০টি অ্যাটেম্পট", priceLabel: "৫০৳", popular: true },
  { attempts: 25, price: 100, label: "২৫টি অ্যাটেম্পট", priceLabel: "১০০৳", best: true },
];

type Step = "package" | "method" | "transaction" | "submitting" | "success";

export default function BuyAttemptsDialog({ open, onClose, onSuccess }: BuyAttemptsDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("package");
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("package");
    setSelectedPkg(null);
    setPaymentMethod(null);
    setTransactionId("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !paymentMethod || !transactionId.trim() || !selectedPkg) return;

    const trimmedId = transactionId.trim();
    if (trimmedId.length < 5 || trimmedId.length > 30) {
      setError("ট্রানজেকশন আইডি ৫-৩০ অক্ষরের মধ্যে হতে হবে");
      return;
    }

    setStep("submitting");
    setError(null);

    const { error: insertError } = await supabase
      .from("attempt_purchases")
      .insert({
        user_id: user.id,
        payment_method: paymentMethod,
        transaction_id: trimmedId,
        amount: selectedPkg.price,
        attempts_count: selectedPkg.attempts,
      });

    if (insertError) {
      if (insertError.message.includes("unique_transaction_id") || insertError.message.includes("duplicate")) {
        setError("এই ট্রানজেকশন আইডি আগেই ব্যবহার করা হয়েছে");
      } else {
        setError("সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
      setStep("transaction");
      return;
    }

    setStep("success");
    toast.success("পেমেন্ট রিকোয়েস্ট সাবমিট হয়েছে!");
    onSuccess?.();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-sm p-6 rounded-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-5">
            <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-display text-lg font-bold text-foreground">অতিরিক্ত অ্যাটেম্পট কিনুন</h3>
          </div>

          {/* Step: Package Selection */}
          {step === "package" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">প্যাকেজ নির্বাচন করুন</p>
              <div className="space-y-2.5">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.attempts}
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setStep("method");
                    }}
                    className="w-full glass-card p-4 rounded-xl flex items-center justify-between transition-all hover:border-primary/40 group relative overflow-hidden"
                  >
                    {pkg.popular && (
                      <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        জনপ্রিয়
                      </span>
                    )}
                    {pkg.best && (
                      <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        সেরা দাম
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{pkg.label}</p>
                        <p className="text-xs text-muted-foreground">
                          প্রতি অ্যাটেম্পট ৳{(pkg.price / pkg.attempts).toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xl font-bold text-accent">{pkg.priceLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Payment Method */}
          {step === "method" && selectedPkg && (
            <div className="space-y-3">
              <div className="glass-card p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">নির্বাচিত প্যাকেজ</p>
                <p className="font-semibold text-foreground">{selectedPkg.label} – <span className="text-accent">{selectedPkg.priceLabel}</span></p>
              </div>
              <p className="text-sm text-muted-foreground text-center">পেমেন্ট মেথড নির্বাচন করুন</p>
              <div className="grid grid-cols-2 gap-3">
                {(["bkash", "nagad"] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setStep("transaction");
                    }}
                    className="glass-card p-4 rounded-xl text-center transition-all hover:border-primary/40"
                  >
                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${method === "bkash" ? "text-neon-pink" : "text-accent"}`} />
                    <span className="font-semibold text-foreground text-sm">
                      {method === "bkash" ? "bKash" : "Nagad"}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setStep("package"); setSelectedPkg(null); }}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                প্যাকেজ পরিবর্তন করুন
              </button>
            </div>
          )}

          {/* Step: Transaction ID */}
          {step === "transaction" && paymentMethod && selectedPkg && (
            <div className="space-y-4">
              <div className="glass-card p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">প্যাকেজ ও মেথড</p>
                <p className="font-semibold text-foreground">
                  {selectedPkg.label} – {selectedPkg.priceLabel} • {paymentMethod === "bkash" ? "bKash" : "Nagad"}
                </p>
              </div>

              <div className="glass-card p-4 rounded-lg text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground text-center mb-2">পেমেন্ট নির্দেশনা</p>
                <p>১. {paymentMethod === "bkash" ? "bKash" : "Nagad"} অ্যাপ খুলুন</p>
                <p>২. ৳{selectedPkg.price} পাঠান: <span className="text-primary font-mono">01XXXXXXXXX</span></p>
                <p>৩. ট্রানজেকশন আইডি কপি করুন</p>
                <p>৪. নিচে পেস্ট করুন</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ট্রানজেকশন আইডি দিন</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => {
                    setTransactionId(e.target.value);
                    setError(null);
                  }}
                  placeholder="যেমন: TXN123ABC456"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                />
                {error && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setStep("method"); setError(null); }}
                  className="flex-1 py-2.5 rounded-xl glass-card text-muted-foreground font-medium text-sm"
                >
                  পিছনে
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!transactionId.trim()}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
                >
                  সাবমিট করুন
                </button>
              </div>
            </div>
          )}

          {/* Step: Submitting */}
          {step === "submitting" && (
            <div className="text-center py-6">
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-3" />
              <p className="text-muted-foreground">পেমেন্ট যাচাই করা হচ্ছে...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && selectedPkg && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <p className="font-semibold text-foreground">রিকোয়েস্ট সাবমিট হয়েছে!</p>
              <p className="text-sm text-muted-foreground">
                অ্যাডমিন অনুমোদন করলে {selectedPkg.label} যোগ হবে।
              </p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm"
              >
                ঠিক আছে
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
