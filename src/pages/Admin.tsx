import { useState } from "react";
import { Shield, Users, Trophy, CreditCard, BarChart3, AlertTriangle, Download, Megaphone, Settings, Share2 } from "lucide-react";

const tabs = [
  { key: "overview", label: "ওভারভিউ", icon: BarChart3 },
  { key: "users", label: "ইউজার", icon: Users },
  { key: "leaderboard", label: "লিডারবোর্ড", icon: Trophy },
  { key: "payouts", label: "পেআউট", icon: CreditCard },
  { key: "referrals", label: "রেফারেল", icon: Share2 },
  { key: "announcements", label: "ঘোষণা", icon: Megaphone },
];

const mockUsers = [
  { id: 1, username: "TapKing_BD", email: "tapking@mail.com", totalPlays: 45, isBanned: false },
  { id: 2, username: "SpeedTapper", email: "speed@mail.com", totalPlays: 38, isBanned: false },
  { id: 3, username: "SusBot99", email: "sus@mail.com", totalPlays: 200, isBanned: true },
];

const mockPayouts = [
  { id: 1, username: "TapKing_BD", amount: 3000, method: "bKash", number: "01712345678", status: "pending" },
  { id: 2, username: "SpeedTapper", amount: 2000, method: "Nagad", number: "01812345678", status: "approved" },
  { id: 3, username: "RajuGamer", amount: 1000, method: "bKash", number: "01912345678", status: "paid" },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 min-h-screen glass-card border-r border-border/30 p-4 hidden md:block">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display text-sm font-bold text-primary">ADMIN</span>
          </div>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/30 flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs ${
                activeTab === tab.key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">অ্যাডমিন ড্যাশবোর্ড</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "মোট ইউজার", value: "2,847", color: "text-primary" },
                  { label: "আজকের খেলা", value: "342", color: "text-secondary" },
                  { label: "গড় স্কোর", value: "54", color: "text-accent" },
                  { label: "পেন্ডিং পেআউট", value: "৳12,500", color: "text-neon-pink" },
                ].map((s, i) => (
                  <div key={i} className="glass-card p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="glass-card p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> সন্দেহজনক স্কোর
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>SusBot99 — স্কোর ১২০ (অসম্ভব), ফ্ল্যাগড</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">ইউজার ম্যানেজমেন্ট</h2>
                <button className="text-sm text-primary flex items-center gap-1">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">ইউজারনেম</th>
                        <th className="text-left p-3">ইমেইল</th>
                        <th className="text-right p-3">খেলা</th>
                        <th className="text-right p-3">স্ট্যাটাস</th>
                        <th className="text-right p-3">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {mockUsers.map(u => (
                        <tr key={u.id}>
                          <td className="p-3 text-foreground font-medium">{u.username}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3 text-right text-foreground">{u.totalPlays}</td>
                          <td className="p-3 text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBanned ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                              {u.isBanned ? "ব্যান" : "সক্রিয়"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button className="text-xs text-destructive hover:underline">
                              {u.isBanned ? "আনব্যান" : "ব্যান"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payouts" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">পেআউট ম্যানেজমেন্ট</h2>
                <button className="text-sm text-primary flex items-center gap-1">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">ইউজার</th>
                        <th className="text-right p-3">পরিমাণ</th>
                        <th className="text-left p-3">মেথড</th>
                        <th className="text-left p-3">নম্বর</th>
                        <th className="text-right p-3">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {mockPayouts.map(p => (
                        <tr key={p.id}>
                          <td className="p-3 text-foreground font-medium">{p.username}</td>
                          <td className="p-3 text-right font-display text-accent">৳{p.amount}</td>
                          <td className="p-3 text-muted-foreground">{p.method}</td>
                          <td className="p-3 text-muted-foreground">{p.number}</td>
                          <td className="p-3 text-right space-x-2">
                            {p.status === "pending" && (
                              <>
                                <button className="text-xs text-primary hover:underline">অনুমোদন</button>
                                <button className="text-xs text-destructive hover:underline">প্রত্যাখ্যান</button>
                              </>
                            )}
                            {p.status === "approved" && (
                              <button className="text-xs text-primary hover:underline">পরিশোধিত</button>
                            )}
                            {p.status === "paid" && (
                              <span className="text-xs text-primary">✓ পরিশোধিত</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">লিডারবোর্ড ম্যানেজমেন্ট</h2>
              <p className="text-sm text-muted-foreground">চলতি সপ্তাহের লিডারবোর্ড এখানে দেখুন এবং প্রয়োজনে স্কোর অ্যাডজাস্ট করুন।</p>
            </div>
          )}

          {activeTab === "referrals" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">রেফারেল ম্যানেজমেন্ট</h2>
                <button className="text-sm text-primary flex items-center gap-1">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>

              {/* Top Referrers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "মোট রেফারেল", value: "156", color: "text-primary" },
                  { label: "ভেরিফাইড", value: "124", color: "text-accent" },
                  { label: "পেন্ডিং", value: "32", color: "text-secondary" },
                  { label: "টপ রেফারার পয়েন্ট", value: "480", color: "text-neon-pink" },
                ].map((s, i) => (
                  <div key={i} className="glass-card p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Top Referrers Table */}
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">টপ রেফারার</h3>
              <div className="glass-card overflow-hidden rounded-xl mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground">
                        <th className="text-left p-3">ইউজারনেম</th>
                        <th className="text-right p-3">রেফারেল</th>
                        <th className="text-right p-3">ভেরিফাইড</th>
                        <th className="text-right p-3">পয়েন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {[
                        { username: "TapKing_BD", total: 24, verified: 22, points: 440 },
                        { username: "SpeedTapper", total: 18, verified: 15, points: 300 },
                        { username: "RajuGamer", total: 12, verified: 10, points: 200 },
                      ].map((u, i) => (
                        <tr key={i}>
                          <td className="p-3 text-foreground font-medium">{u.username}</td>
                          <td className="p-3 text-right text-foreground">{u.total}</td>
                          <td className="p-3 text-right text-primary">{u.verified}</td>
                          <td className="p-3 text-right font-display text-accent">{u.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suspicious Referrals */}
              <div className="glass-card p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> সন্দেহজনক রেফারেল
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>কোনো সন্দেহজনক রেফারেল পাওয়া যায়নি।</p>
                </div>
              </div>
            </div>
          )}


            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">ঘোষণা</h2>
              <form onSubmit={e => e.preventDefault()} className="glass-card p-4 space-y-3">
                <input placeholder="শিরোনাম" className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <textarea placeholder="বার্তা" className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" />
                <button type="submit" className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm">
                  প্রকাশ করুন
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
