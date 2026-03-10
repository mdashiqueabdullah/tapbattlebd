import { PRIZE_DISTRIBUTION } from "@/lib/prizes";
import { Trophy } from "lucide-react";

export default function PrizeTable() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/30 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-foreground">পুরস্কার বিভাজন — প্রতি মাস ৳১৫,০০০</h3>
      </div>
      <div className="divide-y divide-border/20">
        {PRIZE_DISTRIBUTION.map((p, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < 3 ? "bg-accent/5" : ""}`}>
            <div className="flex items-center gap-3">
              {i === 0 && <span className="text-2xl">🥇</span>}
              {i === 1 && <span className="text-2xl">🥈</span>}
              {i === 2 && <span className="text-2xl">🥉</span>}
              {i > 2 && <span className="text-muted-foreground text-sm w-8">#{p.rankRange}</span>}
              <span className="text-foreground font-medium">র‍্যাঙ্ক {p.rankRange}</span>
            </div>
            <div className="text-right">
              <span className="font-display font-bold text-accent">৳{p.amount.toLocaleString()}</span>
              {p.count > 1 && <span className="text-xs text-muted-foreground ml-1">× {p.count} জন</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
