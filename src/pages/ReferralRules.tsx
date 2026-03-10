import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Gift, CheckCircle, XCircle, HelpCircle, AlertTriangle, Share2, UserPlus, Phone, Shield, Star, ChevronRight } from "lucide-react";

const steps = [
  { icon: Share2, text: "আপনার রেফার লিংক বা রেফার কোড শেয়ার করুন" },
  { icon: UserPlus, text: "নতুন ইউজার সেই লিংক/কোড দিয়ে সাইন আপ করবে" },
  { icon: Shield, text: "নতুন ইউজারকে অ্যাকাউন্ট সম্পূর্ণ করতে হবে" },
  { icon: Phone, text: "নতুন ইউজারকে ফোন ভেরিফাই করতে হবে" },
  { icon: Gift, text: "সব শর্ত পূরণ হলে আপনি ২০ রেফার পয়েন্ট পাবেন" },
];

const validRules = [
  "নতুন ইউজার রেফার লিংক বা রেফার কোড দিয়ে সাইন আপ করেছে",
  "নতুন ইউজার অ্যাকাউন্ট রেজিস্ট্রেশন সম্পূর্ণ করেছে",
  "নতুন ইউজার ফোন নম্বর সফলভাবে ভেরিফাই করেছে",
  "নতুন ইউজার প্রোফাইল তথ্য সম্পূর্ণ করেছে",
  "নতুন ইউজার প্ল্যাটফর্ম ব্যবহার শুরু করেছে",
  "প্রতি রেফার্ড ইউজারের জন্য রিওয়ার্ড শুধুমাত্র একবার দেওয়া হবে",
];

const invalidRules = [
  "নিজেকে নিজে রেফার করা যাবে না",
  "একই ফোন নম্বর দিয়ে একাধিক অ্যাকাউন্ট খোলা যাবে না",
  "ভুয়া বা ডুপ্লিকেট অ্যাকাউন্ট অনুমোদিত নয়",
  "ফোন ভেরিফিকেশন অসম্পূর্ণ থাকলে রেফার পয়েন্ট দেওয়া হবে না",
  "অ্যাকাউন্ট রেজিস্ট্রেশন অসম্পূর্ণ থাকলে রেফার পয়েন্ট দেওয়া হবে না",
  "সন্দেহজনক অ্যাকাউন্ট অ্যাডমিন দ্বারা রিভিউ বা বাতিল হতে পারে",
];

const faqs = [
  {
    q: "রেফার পয়েন্ট কবে যুক্ত হবে?",
    a: "রেফার পয়েন্ট শুধুমাত্র তখনই যুক্ত হবে যখন রেফার্ড ইউজার সকল শর্ত পূরণ করবে — সাইন আপ, ফোন ভেরিফিকেশন এবং প্রোফাইল সম্পূর্ণ করা।",
  },
  {
    q: "ফোন ভেরিফাই না করলে কি রেফার পয়েন্ট পাব?",
    a: "না। ফোন ভেরিফিকেশন বাধ্যতামূলক। ফোন ভেরিফাই ছাড়া রেফার পয়েন্ট দেওয়া হবে না।",
  },
  {
    q: "একই ব্যক্তি কি একাধিক অ্যাকাউন্ট খুলতে পারবে?",
    a: "না। প্রতিটি ফোন নম্বর শুধুমাত্র একটি অ্যাকাউন্টের জন্য ব্যবহার করা যাবে। ডুপ্লিকেট বা ভুয়া অ্যাকাউন্ট অনুমোদিত নয়।",
  },
  {
    q: "আমার রেফার কিভাবে ট্র্যাক হবে?",
    a: "আপনার রেফার কোড বা লিংক ব্যবহার করে সাইন আপ করা ইউজারদের তথ্য স্বয়ংক্রিয়ভাবে ট্র্যাক করা হয়। ড্যাশবোর্ডে আপনার রেফার হিস্ট্রি দেখতে পারবেন।",
  },
  {
    q: "রেফার পয়েন্ট কি গেম স্কোরের সাথে যোগ হবে?",
    a: "হ্যাঁ! রেফার পয়েন্ট গেম স্কোরের সাথে যোগ হবে এবং লিডারবোর্ডে প্রভাব ফেলবে। মোট স্কোর = গেম স্কোর + রেফার পয়েন্ট।",
  },
];

export default function ReferralRules() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">রেফার রুলস</h1>
          </div>

          {/* Summary Box */}
          <div className="glass-card neon-border p-5 mb-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" /> রেফার সারসংক্ষেপ
            </h2>
            <p className="text-sm font-semibold text-primary mb-3">রেফার পয়েন্ট গেম স্কোরের সাথে যোগ হবে এবং লিডারবোর্ডে প্রভাব ফেলবে।</p>
            <p className="text-xs text-muted-foreground mb-3">মোট স্কোর = গেম স্কোর + রেফার পয়েন্ট</p>
            <ul className="space-y-2">
              {[
                "প্রতি সফল রেফারে ২০ পয়েন্ট",
                "আনলিমিটেড রেফার করা যাবে",
                "ফোন ভেরিফিকেশন বাধ্যতামূলক",
                "অসম্পূর্ণ অ্যাকাউন্টে রেফার পয়েন্ট দেওয়া হবে না",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How It Works */}
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-4">কিভাবে কাজ করে?</h2>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">ধাপ {i + 1}</p>
                    <p className="text-sm font-medium text-foreground">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Valid Referral Conditions */}
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" /> রেফার কখন গণনা হবে
            </h2>
            <div className="glass-card p-4">
              <p className="text-sm text-muted-foreground mb-3">
                একটি রেফার তখনই বৈধ হবে যখন নিচের সব শর্ত পূরণ হবে:
              </p>
              <ul className="space-y-2">
                {validRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Invalid Referral Conditions */}
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" /> কোন রেফার গণনা হবে না
            </h2>
            <div className="glass-card border border-destructive/20 p-4">
              <ul className="space-y-2">
                {invalidRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <span className="text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 glass-card border border-destructive/20 p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">সতর্কতা: ভুয়া রেফার ধরা পড়লে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করা হতে পারে।</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-secondary" /> সচরাচর জিজ্ঞাসা
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="glass-card p-4 group">
                  <summary className="font-medium text-foreground text-sm cursor-pointer flex items-center justify-between list-none">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/20">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/dashboard"
              className="inline-block w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-lg"
            >
              ড্যাশবোর্ডে যান
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
