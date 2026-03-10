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
          <div key={i} className={`flex items-center justify-between px-4 py-3.5 ${i < 3 ? "bg-accent/5" : ""}`}>
            <div className="flex items-center gap-3 min-w-0">
              {i === 0 && <span className="text-2xl flex-shrink-0 w-9 text-center">🥇</span>}
              {i === 1 && <span className="text-2xl flex-shrink-0 w-9 text-center">🥈</span>}
              {i === 2 && <span className="text-2xl flex-shrink-0 w-9 text-center">🥉</span>}
              {i > 2 && (
                <span className="text-[10px] leading-tight text-muted-foreground flex-shrink-0 w-9 text-center font-mono">
                  #{p.rankRange}
                </span>
              )}
              <span className="text-foreground font-medium text-sm">র‍্যাঙ্ক {p.rankRange}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <span className="font-display font-bold text-accent text-sm">৳{p.amount.toLocaleString()}</span>
              {p.count > 1 && <span className="text-xs text-muted-foreground whitespace-nowrap">× {p.count} জন</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
