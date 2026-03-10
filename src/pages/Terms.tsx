import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6">শর্তাবলী</h1>
          <div className="glass-card p-6 space-y-4 text-sm text-muted-foreground">
            <p>Tap Battle BD ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলী মেনে নিচ্ছেন।</p>
            <h3 className="text-foreground font-bold">যোগ্যতা</h3>
            <p>শুধুমাত্র বাংলাদেশের বাসিন্দারা অংশ নিতে পারবেন। প্রতি ব্যক্তি একটি অ্যাকাউন্ট।</p>
            <h3 className="text-foreground font-bold">খেলার নিয়ম</h3>
            <p>প্রতি সপ্তাহে ১০টি র‍্যাঙ্কড সুযোগ। সেরা স্কোর গণনা হবে। প্র্যাকটিস স্কোর লিডারবোর্ডে যাবে না।</p>
            <h3 className="text-foreground font-bold">অ্যান্টি-চিট</h3>
            <p>কোনো ধরনের বট, স্ক্রিপ্ট, বা অন্যায্য পদ্ধতি ব্যবহার করলে অ্যাকাউন্ট বাতিল হবে।</p>
            <h3 className="text-foreground font-bold">পুরস্কার</h3>
            <p>পুরস্কার বিতরণ অ্যাডমিনের ম্যানুয়াল অনুমোদন সাপেক্ষে। ভুয়া তথ্য দিলে পুরস্কার বাতিল হবে।</p>
            <h3 className="text-foreground font-bold">দায়সীমাবদ্ধতা</h3>
            <p>Tap Battle BD যেকোনো সময় নিয়ম, পুরস্কার পুল, বা সার্ভিস পরিবর্তন করার অধিকার রাখে।</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
