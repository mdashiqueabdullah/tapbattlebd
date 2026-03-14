import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrizeTable from "@/components/PrizeTable";
import { BookOpen } from "lucide-react";

const rules = [
  { q: "এন্ট্রি ফি কত?", a: "কোনো এন্ট্রি ফি নেই। Tap Battle BD সম্পূর্ণ ফ্রি।" },
  { q: "কতবার খেলা যায়?", a: "কোনো অ্যাটেম্পট সীমা নেই! আপনি যত খুশি তত খেলতে পারবেন। প্রতিটি র‍্যাঙ্কড গেমের স্কোর আপনার মোট স্কোরে যোগ হবে।" },
  { q: "কনটেস্ট সিজন কি শেষ হয়?", a: "না! কনটেস্ট সিজন আর শেষ হবে না। আপনি যেকোনো সময় খেলতে পারবেন এবং আপনার স্কোর বাড়াতে পারবেন।" },
  { q: "৫ মিনিট নিষ্ক্রিয় থাকলে কী হবে?", a: "৫ মিনিট নিষ্ক্রিয় থাকলে সেশন স্বয়ংক্রিয়ভাবে শেষ হয়। সেই গেমের ফাইনাল স্কোর সেভ হবে।" },
  { q: "স্কোর কিভাবে গণনা হয়?", a: "প্রতিটি র‍্যাঙ্কড গেমে পাওয়া স্কোর একসাথে যোগ হয়ে মোট অ্যাটেম্পট স্কোর তৈরি করবে। রেফার পয়েন্ট এবং দৈনিক স্ট্রিক পয়েন্টও মোট স্কোরের সাথে যোগ হবে।" },
  { q: "মোট স্কোর ফর্মুলা কী?", a: "মোট স্কোর = সব অ্যাটেম্পট স্কোরের যোগফল + রেফার পয়েন্ট + দৈনিক স্ট্রিক পয়েন্ট। এই মোট স্কোরের ভিত্তিতেই লিডারবোর্ডে র‍্যাঙ্ক নির্ধারণ হবে।" },
  { q: "দৈনিক স্ট্রিক কি লিডারবোর্ডে যোগ হয়?", a: "হ্যাঁ! দৈনিক স্ট্রিক পয়েন্ট সরাসরি আপনার মোট স্কোরে যোগ হয় এবং লিডারবোর্ড র‍্যাঙ্কিং-এ প্রভাব ফেলে।" },
  { q: "টাই-ব্রেকার কিভাবে কাজ করে?", a: "১) বেশি মোট স্কোর জিতবে ২) কম অ্যাটেম্পট ব্যবহার করে অর্জিত স্কোর জিতবে ৩) আগে অর্জিত স্কোর জিতবে।" },
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

          {/* Important Update Banner */}
          <div className="glass-card p-4 mb-6 border border-accent/40 bg-accent/5">
            <h3 className="font-bold text-accent text-sm mb-2">🚨 গুরুত্বপূর্ণ আপডেট</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• কোনো অ্যাটেম্পট সীমা নেই — যত খুশি খেলুন</li>
              <li>• কনটেস্ট সিজন আর শেষ হবে না</li>
              <li>• যেকোনো সময় খেলুন, স্কোর বাড়ান, লিডারবোর্ডে উঠুন!</li>
            </ul>
          </div>

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
