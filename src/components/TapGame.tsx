import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLDEN_TARGET_CHANCE, GOLDEN_TARGET_POINTS, NORMAL_TARGET_POINTS, INACTIVITY_TIMEOUT_MS, INACTIVITY_TIMEOUT_SECONDS } from "@/lib/prizes";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { t } from "@/lib/i18n";

interface TapGameProps {
  isPractice: boolean;
  attemptsRemaining?: number;
  onGameEnd: (score: number) => void;
  onCancel: () => void;
}

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  pts: number;
  isGolden: boolean;
}

export default function TapGame({ isPractice, attemptsRemaining, onGameEnd, onCancel }: TapGameProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [isGolden, setIsGolden] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [tapping, setTapping] = useState(false);
  const scoreRef = useRef(0);
  const coinIdRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const tapLockRef = useRef(false);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    clearInactivityTimer();
    setPhase("done");
  }, [clearInactivityTimer]);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      endSession();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, endSession]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0);
    scoreRef.current = 0;
    setFlyingCoins([]);
    setIsGolden(Math.random() < GOLDEN_TARGET_CHANCE);
  }, []);

  // Start inactivity timer when playing begins
  useEffect(() => {
    if (phase === "playing") {
      resetInactivityTimer();
    }
    return () => clearInactivityTimer();
  }, [phase, resetInactivityTimer, clearInactivityTimer]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (phase !== "playing" || tapLockRef.current) return;

    // Brief lock to prevent duplicate events (touch + click)
    tapLockRef.current = true;
    setTimeout(() => { tapLockRef.current = false; }, 80);

    // Reset inactivity
    resetInactivityTimer();

    // Determine points
    const currentIsGolden = isGolden;
    const pts = currentIsGolden ? GOLDEN_TARGET_POINTS : NORMAL_TARGET_POINTS;

    // Tap feedback
    setTapping(true);
    setTimeout(() => setTapping(false), 100);

    // Get positions for coin animation
    const targetEl = targetRef.current;
    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    const startX = targetRect.left + targetRect.width / 2;
    const startY = targetRect.top + targetRect.height / 2;

    coinIdRef.current += 1;
    const coinId = coinIdRef.current;

    setFlyingCoins(prev => [...prev, {
      id: coinId,
      startX,
      startY,
      pts,
      isGolden: currentIsGolden,
    }]);

    // Randomize next target type
    setIsGolden(Math.random() < GOLDEN_TARGET_CHANCE);

    // Score updates when coin arrives (after animation duration)
    setTimeout(() => {
      const newScore = scoreRef.current + pts;
      scoreRef.current = newScore;
      setScore(newScore);
      setFlyingCoins(prev => prev.filter(c => c.id !== coinId));
    }, 400);
  }, [phase, isGolden, resetInactivityTimer]);

  useEffect(() => {
    if (phase === "done") {
      onGameEnd(scoreRef.current);
    }
  }, [phase, onGameEnd]);

  // Ready screen
  if (phase === "ready") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          {isPractice && (
            <div className="mb-4 px-4 py-2 rounded-full bg-secondary/30 border border-secondary/50 inline-block">
              <span className="text-secondary font-semibold text-sm">{t("practiceMode")}</span>
            </div>
          )}
          {!isPractice && attemptsRemaining !== undefined && (
            <p className="text-muted-foreground mb-4">
              {t("remainingAttempts")}: <span className="text-primary font-bold">{attemptsRemaining}</span>/10
            </p>
          )}
          <h2 className="font-display text-3xl font-bold text-primary neon-text mb-4">TAP BATTLE</h2>
          <p className="text-muted-foreground mb-2">ট্যাপ করতে থাকো, স্কোর বাড়াও!</p>
          <p className="text-muted-foreground text-xs mb-4">৫ মিনিট নিষ্ক্রিয় থাকলে সেশন শেষ হবে</p>
          <div className="flex gap-4 justify-center my-6">
            <div className="glass-card p-3 text-center">
              <div className="w-10 h-10 rounded-full gradient-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">+{NORMAL_TARGET_POINTS} পয়েন্ট</p>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="w-10 h-10 rounded-full gradient-gold mx-auto mb-1" />
              <p className="text-xs text-neon-gold">+{GOLDEN_TARGET_POINTS} পয়েন্ট</p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg neon-border"
          >
            {t("tapToStart")}
          </button>
          <button onClick={onCancel} className="mt-3 text-sm text-muted-foreground hover:text-foreground">
            বাতিল
          </button>
        </div>
      </div>
    );
  }

  // Done screen
  if (phase === "done") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h2 className="font-display text-2xl font-bold text-accent neon-text-gold mb-2">{t("gameOver")}</h2>
          <p className="text-muted-foreground text-sm mb-4">নিষ্ক্রিয়তার কারণে সেশন শেষ হয়েছে</p>
          <div className="glass-card neon-border-gold p-8 my-6">
            <p className="text-muted-foreground text-sm mb-1">{t("finalScore")}</p>
            <p className="font-display text-6xl font-black text-accent neon-text-gold">{scoreRef.current}</p>
          </div>
          {isPractice && (
            <p className="text-secondary text-sm mb-4">এটি প্র্যাকটিস মোড — লিডারবোর্ডে যাবে না</p>
          )}
          {/* ADSENSE: Display ad on game over screen */}
          <RectangleAd className="mb-4" />

          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold mb-3"
          >
            {t("playAgain")}
          </button>
          <button onClick={onCancel} className="w-full py-3 rounded-xl glass-card text-foreground font-semibold">
            {t("dashboard")}
          </button>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="fixed inset-0 z-50 bg-background select-none touch-none">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <button onClick={onCancel} className="glass-card px-3 py-1.5 rounded-full text-xs text-muted-foreground">
          ✕ বাতিল
        </button>
        <div ref={scoreAreaRef} className="glass-card px-4 py-2 rounded-full">
          <span className={`font-display text-xl font-bold text-primary ${score > 0 ? "animate-score-pop" : ""}`}>
            {score}
          </span>
        </div>
        {isPractice && (
          <div className="glass-card px-3 py-1.5 rounded-full">
            <span className="text-secondary text-xs font-semibold">প্র্যাকটিস</span>
          </div>
        )}
        {!isPractice && (
          <div className="glass-card px-3 py-1.5 rounded-full">
            <span className="text-accent text-xs font-semibold">র‍্যাংকড</span>
          </div>
        )}
      </div>

      {/* Fixed center tap target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          ref={targetRef}
          onClick={handleTap}
          onTouchStart={handleTap}
          className={`tap-target w-24 h-24 rounded-full ${isGolden ? "gradient-gold" : "gradient-primary"} transition-transform duration-75 active:scale-90 ${tapping ? "scale-90" : "scale-100"}`}
          style={{
            boxShadow: isGolden
              ? "0 0 30px hsl(var(--neon-gold) / 0.5), 0 0 60px hsl(var(--neon-gold) / 0.2)"
              : "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.2)",
          }}
        />
      </div>

      {/* Flying coin animations */}
      <AnimatePresence>
        {flyingCoins.map(coin => {
          const scoreEl = scoreAreaRef.current;
          const endX = scoreEl ? scoreEl.getBoundingClientRect().left + scoreEl.getBoundingClientRect().width / 2 : window.innerWidth / 2;
          const endY = scoreEl ? scoreEl.getBoundingClientRect().top + scoreEl.getBoundingClientRect().height / 2 : 30;

          return (
            <motion.div
              key={coin.id}
              initial={{ x: coin.startX - 12, y: coin.startY - 12, scale: 1, opacity: 1 }}
              animate={{ x: endX - 12, y: endY - 12, scale: 0.5, opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeIn" }}
              className="fixed pointer-events-none z-20"
              style={{ width: 24, height: 24 }}
            >
              <div className={`w-6 h-6 rounded-full ${coin.isGolden ? "gradient-gold" : "gradient-primary"} shadow-lg flex items-center justify-center`}>
                <span className="text-[10px] font-bold text-primary-foreground">+{coin.pts}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ADSENSE: Small banner at bottom, separated from gameplay */}
      <div className="absolute bottom-0 left-0 right-0 pb-2 pt-10 pointer-events-auto z-0">
        <div className="max-w-md mx-auto px-4">
          <BannerAd />
        </div>
        <p className="text-muted-foreground/50 text-xs text-center mt-1">ট্যাপ করতে থাকো • ৫ মিনিট নিষ্ক্রিয় থাকলে সেশন শেষ</p>
      </div>
    </div>
  );
}
