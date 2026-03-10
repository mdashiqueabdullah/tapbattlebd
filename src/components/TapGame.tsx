import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_DURATION_SECONDS, GOLDEN_TARGET_CHANCE, GOLDEN_TARGET_POINTS, NORMAL_TARGET_POINTS, TARGET_DISPLAY_MS } from "@/lib/prizes";
import { t } from "@/lib/i18n";

interface TapGameProps {
  isPractice: boolean;
  attemptsRemaining?: number;
  onGameEnd: (score: number) => void;
  onCancel: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  isGolden: boolean;
  size: number;
}

export default function TapGame({ isPractice, attemptsRemaining, onGameEnd, onCancel }: TapGameProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [target, setTarget] = useState<Target | null>(null);
  const [combo, setCombo] = useState(0);
  const [showPoints, setShowPoints] = useState<{ x: number; y: number; pts: number } | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const spawnTarget = useCallback(() => {
    const isGolden = Math.random() < GOLDEN_TARGET_CHANCE;
    const size = isGolden ? 56 : 64;
    const padding = 20;
    targetIdRef.current += 1;
    setTarget({
      id: targetIdRef.current,
      x: padding + Math.random() * (100 - 2 * padding),
      y: padding + Math.random() * (100 - 2 * padding),
      isGolden,
      size,
    });
    targetTimerRef.current = setTimeout(() => {
      setTarget(null);
      setCombo(0);
      if (phase === "playing") spawnTarget();
    }, TARGET_DISPLAY_MS);
  }, [phase]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION_SECONDS);
    setCombo(0);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    spawnTarget();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
          setPhase("done");
          setTarget(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    };
  }, [phase, spawnTarget]);

  const handleTap = useCallback((tgt: Target, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    const pts = tgt.isGolden ? GOLDEN_TARGET_POINTS : NORMAL_TARGET_POINTS;
    const newScore = scoreRef.current + pts;
    scoreRef.current = newScore;
    setScore(newScore);
    setCombo(c => c + 1);
    setShowPoints({ x: tgt.x, y: tgt.y, pts });
    setTimeout(() => setShowPoints(null), 500);
    setTarget(null);
    setTimeout(() => spawnTarget(), 100);
  }, [spawnTarget]);

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
          <p className="text-muted-foreground mb-2">৩০ সেকেন্ডে যত পারো ট্যাপ করো!</p>
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
          <div className="glass-card neon-border-gold p-8 my-6">
            <p className="text-muted-foreground text-sm mb-1">{t("finalScore")}</p>
            <p className="font-display text-6xl font-black text-accent neon-text-gold">{scoreRef.current}</p>
          </div>
          {isPractice && (
            <p className="text-secondary text-sm mb-4">এটি প্র্যাকটিস মোড — লিডারবোর্ডে যাবে না</p>
          )}
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
        <div className="glass-card px-3 py-1.5 rounded-full">
          <span className="font-display text-sm text-destructive font-bold">{timeLeft}s</span>
        </div>
        <div className="glass-card px-3 py-1.5 rounded-full">
          <span className={`font-display text-lg font-bold text-primary ${score > 0 ? "animate-score-pop" : ""}`}>
            {score}
          </span>
        </div>
        {combo > 2 && (
          <div className="glass-card px-3 py-1.5 rounded-full">
            <span className="font-display text-sm text-accent font-bold">x{combo}</span>
          </div>
        )}
      </div>

      {/* Game area */}
      <div ref={gameAreaRef} className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {target && (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => handleTap(target, e)}
              onTouchStart={(e) => handleTap(target, e)}
              className={`absolute tap-target ${target.isGolden ? "gradient-gold" : "gradient-primary"}`}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: target.size,
                height: target.size,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Point popup */}
        <AnimatePresence>
          {showPoints && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute font-display font-bold text-xl pointer-events-none ${showPoints.pts > 1 ? "text-accent" : "text-primary"}`}
              style={{ left: `${showPoints.x}%`, top: `${showPoints.y}%` }}
            >
              +{showPoints.pts}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
