import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrizeTable from "@/components/PrizeTable";
import { BookOpen } from "lucide-react";

const rules = [
  { q: "এন্ট্রি ফি কত?", a: "কোনো এন্ট্রি ফি নেই। Tap Battle BD সম্পূর্ণ ফ্রি।" },
  { q: "প্রতি মাসে কতবার খেলা যায়?", a: "প্রতিটি খেলোয়াড় প্রতি প্রতিযোগিতায় ১০টি র‍্যাঙ্কড অ্যাটেম্পট পাবে। প্র্যাকটিস সীমাহীন।" },
  { q: "৫ মিনিট নিষ্ক্রিয় থাকলে কী হবে?", a: "৫ মিনিট নিষ্ক্রিয় থাকলে সেশন স্বয়ংক্রিয়ভাবে শেষ হয়। সেই অ্যাটেম্পট ব্যবহৃত হিসেবে গণ্য হবে এবং ফাইনাল স্কোর সেভ হবে।" },
  { q: "স্কোর কিভাবে গণনা হয়?", a: "প্রতিটি অ্যাটেম্পটে পাওয়া স্কোর একসাথে যোগ হয়ে মোট অ্যাটেম্পট স্কোর তৈরি করবে। রেফার পয়েন্ট এবং দৈনিক স্ট্রিক পয়েন্টও মোট স্কোরের সাথে যোগ হবে।" },
  { q: "মোট স্কোর ফর্মুলা কী?", a: "মোট স্কোর = সব অ্যাটেম্পট স্কোরের যোগফল + রেফার পয়েন্ট + দৈনিক স্ট্রিক পয়েন্ট। এই মোট স্কোরের ভিত্তিতেই লিডারবোর্ডে র‍্যাঙ্ক নির্ধারণ হবে।" },
  { q: "দৈনিক স্ট্রিক কি লিডারবোর্ডে যোগ হয়?", a: "হ্যাঁ! দৈনিক স্ট্রিক পয়েন্ট সরাসরি আপনার মোট স্কোরে যোগ হয় এবং লিডারবোর্ড র‍্যাঙ্কিং-এ প্রভাব ফেলে।" },
  { q: "টাই-ব্রেকার কিভাবে কাজ করে?", a: "১) বেশি মোট স্কোর জিতবে ২) কম অ্যাটেম্পট ব্যবহার করে অর্জিত স্কোর জিতবে ৩) আগে অর্জিত স্কোর জিতবে।" },
  { q: "মাসিক কনটেস্ট কখন শুরু ও শেষ হয়?", a: "প্রতি মাসের ১ তারিখ রাত ১২:০০ টায় শুরু এবং শেষ দিন রাত ১১:৫৯:৫৯ তে শেষ (বাংলাদেশ সময়)।" },
  { q: "সন্দেহজনক স্কোর?", a: "অ্যাডমিন সন্দেহজনক স্কোর পর্যালোচনা করতে পারে। ভুয়া অ্যাকাউন্ট অযোগ্য ঘোষিত হতে পারে।" },
  { q: "পুরস্কার কিভাবে পাবো?", a: "বিজয়ীদের পেআউট অনুরোধ জমা দিতে হবে। অ্যাডমিন যাচাই করে bKash/Nagad এ পাঠাবে।" },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> নিয়মাবলী
          </h1>

          {/* Score formula highlight */}
          <div className="glass-card p-4 mb-6 neon-border">
            <h3 className="font-bold text-foreground text-sm mb-2">📊 স্কোর ফর্মুলা</h3>
            <p className="text-sm text-primary font-display font-bold mb-2">মোট স্কোর = অ্যাটেম্পট স্কোর + রেফার পয়েন্ট + স্ট্রিক পয়েন্ট</p>
            <p className="text-xs text-muted-foreground">সব অ্যাটেম্পটের স্কোর যোগ হবে। রেফারেল ও দৈনিক স্ট্রিক পয়েন্টও মোট স্কোরে অন্তর্ভুক্ত।</p>
          </div>

          <div className="space-y-3 mb-8">
            {rules.map((r, i) => (
              <div key={i} className="glass-card p-4">
                <h3 className="font-bold text-foreground text-sm mb-1">{r.q}</h3>
                <p className="text-sm text-muted-foreground">{r.a}</p>
              </div>
            ))}
          </div>

          <PrizeTable />
        </div>
      </div>
      <Footer />
    </div>
  );
}
