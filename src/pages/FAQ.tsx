import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Tap Battle BD কি?", a: "এটি একটি সাপ্তাহিক ট্যাপ চ্যালেঞ্জ প্ল্যাটফর্ম যেখানে আপনি ৩০ সেকেন্ডে ট্যাপ করে স্কোর করেন এবং টপ ১০০ জন সাপ্তাহিক পুরস্কার জিতে নেন।" },
  { q: "এটা কি সত্যিই ফ্রি?", a: "হ্যাঁ! কোনো এন্ট্রি ফি বা হিডেন চার্জ নেই। সম্পূর্ণ ফ্রি খেলুন এবং জিতুন।" },
  { q: "কিভাবে পুরস্কার পাবো?", a: "বিজয়ী হলে পেআউট অনুরোধ পাঠান। আমাদের টিম যাচাই করে bKash/Nagad এ টাকা পাঠাবে।" },
  { q: "প্র্যাকটিস মোড কি র‍্যাঙ্কিং এ যায়?", a: "না! প্র্যাকটিস মোড শুধু অনুশীলনের জন্য। শুধু র‍্যাঙ্কড গেমের স্কোর লিডারবোর্ডে যায়।" },
  { q: "একটি সপ্তাহে কতবার খেলতে পারি?", a: "র‍্যাঙ্কড মোডে ১০ বার, প্র্যাকটিস সীমাহীন।" },
  { q: "গেমের মাঝে ফোন বন্ধ হলে?", a: "একটি চেষ্টা খরচ হবে। তাই স্থিতিশীল ইন্টারনেট ব্যবহার করুন।" },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> জিজ্ঞাসা (FAQ)
          </h1>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass-card p-4">
                <h3 className="font-bold text-foreground text-sm mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
