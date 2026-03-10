import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Phone, CreditCard, Calendar, Target, Trophy, Gamepad2 } from "lucide-react";

export default function Profile() {
  const user = {
    username: "Player_BD",
    fullName: "রহিম উদ্দিন",
    email: "rahim@example.com",
    mobile: "01712345678",
    payoutMethod: "bKash",
    bkash: "01712345678",
    joinedAt: "মার্চ ২০২৬",
    totalRanked: 45,
    totalPractice: 120,
    lifetimeBest: 82,
    totalWins: 3,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> প্রোফাইল
          </h1>

          {/* Profile Card */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary-foreground">
                  {user.username[0]}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">{user.username}</h2>
                <p className="text-sm text-muted-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> যোগদান: {user.joinedAt}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">ইমেইল</span>
                <span className="text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">মোবাইল</span>
                <span className="text-foreground">{user.mobile}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">পেমেন্ট</span>
                <span className="text-foreground">{user.payoutMethod}: {user.bkash}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <h3 className="font-bold text-foreground mb-3">গেম পরিসংখ্যান</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Gamepad2, label: "র‍্যাঙ্কড খেলা", value: user.totalRanked, color: "text-primary" },
              { icon: Target, label: "প্র্যাকটিস", value: user.totalPractice, color: "text-secondary" },
              { icon: Trophy, label: "সেরা স্কোর", value: user.lifetimeBest, color: "text-accent" },
              { icon: CreditCard, label: "মোট জয়", value: user.totalWins, color: "text-neon-pink" },
            ].map((s, i) => (
              <div key={i} className="glass-card p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl glass-card text-foreground font-semibold border border-border/50">
            প্রোফাইল সম্পাদনা করুন
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
