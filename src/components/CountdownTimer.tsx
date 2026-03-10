import { useState, useEffect } from "react";

function getMonthEnd(): Date {
  const now = new Date();
  const bdtOffset = 6 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bdt = new Date(utc + bdtOffset * 60000);
  
  // Last day of current month at 23:59:59.999 BDT
  const endOfMonth = new Date(bdt.getFullYear(), bdt.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  // Convert back to UTC
  return new Date(endOfMonth.getTime() - bdtOffset * 60000);
}

export default function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const end = getMonthEnd();
      const diff = Math.max(0, end.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <span className="font-display text-primary text-sm">
        {timeLeft.days}দিন {timeLeft.hours}ঘ {timeLeft.minutes}মি
      </span>
    );
  }

  const blocks = [
    { val: timeLeft.days, label: "দিন" },
    { val: timeLeft.hours, label: "ঘণ্টা" },
    { val: timeLeft.minutes, label: "মিনিট" },
    { val: timeLeft.seconds, label: "সেকেন্ড" },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {blocks.map((b, i) => (
        <div key={i} className="glass-card neon-border px-3 py-2 min-w-[60px] text-center">
          <div className="font-display text-2xl font-bold text-primary neon-text">
            {String(b.val).padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
