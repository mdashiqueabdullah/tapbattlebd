import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, Check } from "lucide-react";

export default function Payout() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-10 px-4">
          <div className="max-w-sm mx-auto text-center mt-12">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">পেআউট অনুরোধ জমা হয়েছে!</h2>
            <p className="text-sm text-muted-foreground">আমাদের টিম আপনার অনুরোধ পর্যালোচনা করবে। অনুগ্রহ করে ২৪-৪৮ ঘণ্টা অপেক্ষা করুন।</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-neon-pink" /> পেআউট অনুরোধ
          </h1>

          <div className="glass-card p-4 mb-6 border-l-4 border-accent">
            <p className="text-sm text-foreground font-medium">🎉 অভিনন্দন!</p>
            <p className="text-xs text-muted-foreground mt-1">আপনি এই মাসে ১৫০ টাকা জিতেছেন। পেআউট পেতে নিচের ফর্ম পূরণ করুন।</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">পূর্ণ নাম</label>
              <input required className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">মোবাইল নম্বর</label>
              <input required className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">পেমেন্ট মেথড</label>
              <select required className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">bKash/Nagad নম্বর</label>
              <input required className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">NID শেষ ৪ ডিজিট (ঐচ্ছিক)</label>
              <input maxLength={4} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">নোটস (ঐচ্ছিক)</label>
              <textarea className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold">
              পেআউট অনুরোধ জমা দিন
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
