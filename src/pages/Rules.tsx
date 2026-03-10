import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrizeTable from "@/components/PrizeTable";
import { BookOpen } from "lucide-react";

const rules = [
  { q: "এন্ট্রি ফি কত?", a: "কোনো এন্ট্রি ফি নেই। Tap Battle BD সম্পূর্ণ ফ্রি।" },
  { q: "প্রতি সপ্তাহে কতবার খেলা যায়?", a: "প্রতি সপ্তাহে ১০টি র‍্যাঙ্কড সুযোগ পাবেন। প্র্যাকটিস সীমাহীন।" },
  { q: "লিডারবোর্ডে কোন স্কোর যায়?", a: "শুধুমাত্র সপ্তাহের সেরা স্কোর লিডারবোর্ডে গণনা হয়।" },
  { q: "টাই-ব্রেকার কিভাবে কাজ করে?", a: "১) বেশি স্কোর জিতবে ২) কম চেষ্টায় অর্জিত স্কোর জিতবে ৩) আগে অর্জিত স্কোর জিতবে।" },
  { q: "সাপ্তাহিক কনটেস্ট কখন শুরু ও শেষ হয়?", a: "প্রতি সোমবার রাত ১২:০০ টায় শুরু এবং রবিবার রাত ১১:৫৯:৫৯ তে শেষ (বাংলাদেশ সময়)।" },
  { q: "সন্দেহজনক স্কোর?", a: "অ্যাডমিন সন্দেহজনক স্কোর পর্যালোচনা করতে পারে। ভুয়া অ্যাকাউন্ট অযোগ্য ঘোষিত হতে পারে।" },
  { q: "পুরস্কার কিভাবে পাবো?", a: "বিজয়ীদের পেআউট অনুরোধ জমা দিতে হবে। অ্যাডমিন যাচাই করে bKash/Nagad এ পাঠাবে।" },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> নিয়মাবলী
          </h1>

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
