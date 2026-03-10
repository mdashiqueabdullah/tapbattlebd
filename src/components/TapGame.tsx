import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GOLDEN_TARGET_CHANCE, GOLDEN_TARGET_POINTS, NORMAL_TARGET_POINTS,
  RED_TARGET_CHANCE, RED_TARGET_POINTS, MEGA_TARGET_CHANCE, MEGA_TARGET_POINTS,
  INACTIVITY_TIMEOUT_MS, INACTIVITY_TIMEOUT_SECONDS,
  COMBO_THRESHOLD_2X, COMBO_THRESHOLD_3X, COMBO_WINDOW_MS,
  BONUS_EVENT_CHANCE, DOUBLE_SCORE_DURATION_MS,
} from "@/lib/prizes";
import { BannerAd, RectangleAd } from "@/components/ads/AdContainer";
import { t } from "@/lib/i18n";

interface TapGameProps {
  isPractice: boolean;
  attemptsRemaining?: number;
  onGameEnd: (score: number) => void;
  onCancel: () => void;
}

type BallType = "normal" | "golden" | "red" | "mega";

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  pts: number;
  type: BallType;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

// Simple audio using oscillator — no file loading needed
const audioCtxRef = { current: null as AudioContext | null };
function getAudioCtx() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtxRef.current;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

const sounds = {
  tap: () => playTone(880, 0.08, "sine", 0.06),
  golden: () => { playTone(1200, 0.15, "sine", 0.08); setTimeout(() => playTone(1500, 0.1, "sine", 0.06), 80); },
  red: () => playTone(200, 0.2, "sawtooth", 0.05),
  mega: () => { playTone(800, 0.1, "square", 0.05); setTimeout(() => playTone(1200, 0.1, "square", 0.05), 100); setTimeout(() => playTone(1600, 0.15, "square", 0.05), 200); },
  combo: () => { playTone(1000, 0.08, "sine", 0.06); setTimeout(() => playTone(1400, 0.12, "sine", 0.06), 60); },
  bonus: () => { playTone(600, 0.12, "triangle", 0.07); setTimeout(() => playTone(900, 0.12, "triangle", 0.07), 120); setTimeout(() => playTone(1200, 0.2, "triangle", 0.07), 240); },
};

function pickBallType(): BallType {
  const r = Math.random();
  if (r < MEGA_TARGET_CHANCE) return "mega";
  if (r < MEGA_TARGET_CHANCE + GOLDEN_TARGET_CHANCE) return "golden";
  if (r < MEGA_TARGET_CHANCE + GOLDEN_TARGET_CHANCE + RED_TARGET_CHANCE) return "red";
  return "normal";
}

function getBallPoints(type: BallType): number {
  switch (type) {
    case "golden": return GOLDEN_TARGET_POINTS;
    case "red": return RED_TARGET_POINTS;
    case "mega": return MEGA_TARGET_POINTS;
    default: return NORMAL_TARGET_POINTS;
  }
}

const BALL_STYLES: Record<BallType, { gradient: string; glow: string; label: string }> = {
  normal: {
    gradient: "linear-gradient(135deg, hsl(160 100% 50%), hsl(270 80% 60%))",
    glow: "0 0 20px hsl(160 100% 50% / 0.5), 0 0 40px hsl(160 100% 50% / 0.2)",
    label: "+1",
  },
  golden: {
    gradient: "linear-gradient(135deg, hsl(45 100% 55%), hsl(30 100% 50%))",
    glow: "0 0 25px hsl(45 100% 55% / 0.6), 0 0 50px hsl(45 100% 55% / 0.3)",
    label: "+5",
  },
  red: {
    gradient: "linear-gradient(135deg, hsl(0 84% 60%), hsl(330 90% 50%))",
    glow: "0 0 25px hsl(0 84% 60% / 0.6), 0 0 50px hsl(0 84% 60% / 0.3)",
    label: "-3",
  },
  mega: {
    gradient: "linear-gradient(135deg, hsl(280 100% 65%), hsl(200 100% 60%), hsl(45 100% 60%))",
    glow: "0 0 30px hsl(280 100% 65% / 0.6), 0 0 60px hsl(200 100% 60% / 0.3), 0 0 80px hsl(45 100% 60% / 0.2)",
    label: "+10",
  },
};

// Safe area for ball movement (percentage of viewport)
const MOVE_AREA = { xMin: 15, xMax: 85, yMin: 18, yMax: 75 };

function randomPosition() {
  return {
    x: MOVE_AREA.xMin + Math.random() * (MOVE_AREA.xMax - MOVE_AREA.xMin),
    y: MOVE_AREA.yMin + Math.random() * (MOVE_AREA.yMax - MOVE_AREA.yMin),
  };
}

export default function TapGame({ isPractice, attemptsRemaining, onGameEnd, onCancel }: TapGameProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [ballType, setBallType] = useState<BallType>("normal");
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tapping, setTapping] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [bonusEvent, setBonusEvent] = useState<string | null>(null);
  const [isDoubleScore, setIsDoubleScore] = useState(false);

  const scoreRef = useRef(0);
  const coinIdRef = useRef(0);
  const textIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const tapLockRef = useRef(false);
  const lastTapTimeRef = useRef(0);
  const comboCountRef = useRef(0);
  const doubleScoreTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) { clearTimeout(inactivityTimerRef.current); inactivityTimerRef.current = null; }
  }, []);

  const endSession = useCallback(() => {
    clearInactivityTimer();
    if (doubleScoreTimerRef.current) { clearTimeout(doubleScoreTimerRef.current); }
    setPhase("done");
  }, [clearInactivityTimer]);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(endSession, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, endSession]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0);
    scoreRef.current = 0;
    setFlyingCoins([]);
    setFloatingTexts([]);
    setParticles([]);
    setCombo(0);
    setComboMultiplier(1);
    comboCountRef.current = 0;
    setBonusEvent(null);
    setIsDoubleScore(false);
    setBallType(pickBallType());
  }, []);

  // Start inactivity timer when playing begins
  useEffect(() => {
    if (phase === "playing") {
      resetInactivityTimer();
    }
    return () => clearInactivityTimer();
  }, [phase, resetInactivityTimer, clearInactivityTimer]);

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    const count = 6;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particleIdRef.current += 1;
      newParticles.push({
        id: particleIdRef.current,
        x, y,
        color,
        angle: (360 / count) * i + Math.random() * 30,
        speed: 40 + Math.random() * 30,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 500);
  }, []);

  // Spawn floating text
  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    textIdRef.current += 1;
    const id = textIdRef.current;
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 800);
  }, []);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (phase !== "playing" || tapLockRef.current) return;
    tapLockRef.current = true;
    setTimeout(() => { tapLockRef.current = false; }, 60);

    resetInactivityTimer();

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    // Combo tracking
    if (timeSinceLastTap < COMBO_WINDOW_MS) {
      comboCountRef.current += 1;
    } else {
      comboCountRef.current = 1;
    }
    const currentCombo = comboCountRef.current;
    setCombo(currentCombo);

    let multiplier = 1;
    if (currentCombo >= COMBO_THRESHOLD_3X) {
      multiplier = 3;
      if (comboMultiplier < 3) sounds.combo();
    } else if (currentCombo >= COMBO_THRESHOLD_2X) {
      multiplier = 2;
      if (comboMultiplier < 2) sounds.combo();
    }
    setComboMultiplier(multiplier);

    const currentType = ballType;
    let basePts = getBallPoints(currentType);

    // Apply combo only to positive scores
    if (basePts > 0) basePts *= multiplier;
    // Apply double score bonus
    if (isDoubleScore && basePts > 0) basePts *= 2;

    // Play sound
    switch (currentType) {
      case "golden": sounds.golden(); break;
      case "red": sounds.red(); break;
      case "mega": sounds.mega(); break;
      default: sounds.tap(); break;
    }

    // Visual feedback
    setTapping(true);
    setTimeout(() => setTapping(false), 80);

    // Get ball position for effects
    const targetEl = targetRef.current;
    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    const startX = targetRect.left + targetRect.width / 2;
    const startY = targetRect.top + targetRect.height / 2;

    // Particles
    const particleColor = currentType === "golden" ? "hsl(45, 100%, 55%)"
      : currentType === "red" ? "hsl(0, 84%, 60%)"
      : currentType === "mega" ? "hsl(280, 100%, 65%)"
      : "hsl(160, 100%, 50%)";
    spawnParticles(startX, startY, particleColor);

    // Floating text
    const textColor = basePts < 0 ? "text-destructive" : currentType === "golden" ? "text-neon-gold" : currentType === "mega" ? "text-secondary" : "text-primary";
    const comboText = multiplier > 1 ? ` ×${multiplier}` : "";
    const doubleText = isDoubleScore && basePts > 0 ? " 🔥" : "";
    spawnFloatingText(startX, startY - 30, `${basePts > 0 ? "+" : ""}${basePts}${comboText}${doubleText}`, textColor);

    // Flying coin
    coinIdRef.current += 1;
    const coinId = coinIdRef.current;
    if (basePts > 0) {
      setFlyingCoins(prev => [...prev, { id: coinId, startX, startY, pts: basePts, type: currentType }]);
    }

    // Pick new ball type
    setBallType(pickBallType());

    // Score update
    setTimeout(() => {
      const newScore = Math.max(0, scoreRef.current + basePts);
      scoreRef.current = newScore;
      setScore(newScore);
      setFlyingCoins(prev => prev.filter(c => c.id !== coinId));
    }, basePts > 0 ? 350 : 100);

    // Random bonus event check
    if (Math.random() < BONUS_EVENT_CHANCE && !bonusEvent) {
      const events = ["double", "mega_spawn"];
      const picked = events[Math.floor(Math.random() * events.length)];
      if (picked === "double") {
        sounds.bonus();
        setBonusEvent("🔥 ডাবল স্কোর!");
        setIsDoubleScore(true);
        if (doubleScoreTimerRef.current) clearTimeout(doubleScoreTimerRef.current);
        doubleScoreTimerRef.current = setTimeout(() => {
          setIsDoubleScore(false);
          setBonusEvent(null);
        }, DOUBLE_SCORE_DURATION_MS);
      } else {
        sounds.bonus();
        setBonusEvent("⭐ মেগা বল!");
        setBallType("mega");
        setTimeout(() => setBonusEvent(null), 2000);
      }
    }
  }, [phase, ballType, isDoubleScore, comboMultiplier, bonusEvent, resetInactivityTimer, spawnParticles, spawnFloatingText]);

  useEffect(() => {
    if (phase === "done") onGameEnd(scoreRef.current);
  }, [phase, onGameEnd]);

  const currentStyle = BALL_STYLES[ballType];

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
          <p className="text-muted-foreground mb-2">বলে ট্যাপ করো, স্কোর বাড়াও!</p>
          <p className="text-muted-foreground text-xs mb-4">{INACTIVITY_TIMEOUT_SECONDS} সেকেন্ড নিষ্ক্রিয় থাকলে সেশন শেষ হবে</p>
          
          {/* Ball types guide */}
          <div className="grid grid-cols-2 gap-3 my-6">
            {([
              { type: "normal" as BallType, label: "সাধারণ", pts: `+${NORMAL_TARGET_POINTS}`, color: "text-primary" },
              { type: "golden" as BallType, label: "গোল্ডেন", pts: `+${GOLDEN_TARGET_POINTS}`, color: "text-neon-gold" },
              { type: "red" as BallType, label: "লাল", pts: `${RED_TARGET_POINTS}`, color: "text-destructive" },
              { type: "mega" as BallType, label: "মেগা", pts: `+${MEGA_TARGET_POINTS}`, color: "text-secondary" },
            ]).map((b, i) => (
              <div key={i} className="glass-card p-3 text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1"
                  style={{ background: BALL_STYLES[b.type].gradient, boxShadow: BALL_STYLES[b.type].glow }}
                />
                <p className={`text-xs font-bold ${b.color}`}>{b.pts} পয়েন্ট</p>
                <p className="text-[10px] text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Combo info */}
          <div className="glass-card p-3 mb-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">🔥 কম্বো সিস্টেম</p>
            <p>{COMBO_THRESHOLD_2X}+ দ্রুত ট্যাপ = ×2 • {COMBO_THRESHOLD_3X}+ দ্রুত ট্যাপ = ×3</p>
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
          <p className="text-muted-foreground text-sm mb-4">{INACTIVITY_TIMEOUT_SECONDS} সেকেন্ড নিষ্ক্রিয়তার কারণে সেশন শেষ হয়েছে</p>
          <div className="glass-card neon-border-gold p-8 my-6">
            <p className="text-muted-foreground text-sm mb-1">{t("finalScore")}</p>
            <p className="font-display text-6xl font-black text-accent neon-text-gold">{scoreRef.current}</p>
          </div>
          {isPractice && (
            <p className="text-secondary text-sm mb-4">এটি প্র্যাকটিস মোড — লিডারবোর্ডে যাবে না</p>
          )}
          <RectangleAd className="mb-4" />
          <button onClick={startGame} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold mb-3">
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
    <div className="fixed inset-0 z-50 bg-background select-none touch-none overflow-hidden">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <button onClick={endSession} className="glass-card px-3 py-1.5 rounded-full text-xs text-muted-foreground">
          ✕ বাতিল
        </button>
        <div ref={scoreAreaRef} className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
          <motion.span
            key={score}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="font-display text-xl font-bold text-primary"
          >
            {score}
          </motion.span>
        </div>
        {isPractice ? (
          <div className="glass-card px-3 py-1.5 rounded-full">
            <span className="text-secondary text-xs font-semibold">প্র্যাকটিস</span>
          </div>
        ) : (
          <div className="glass-card px-3 py-1.5 rounded-full">
            <span className="text-accent text-xs font-semibold">র‍্যাংকড</span>
          </div>
        )}
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {comboMultiplier > 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-10"
          >
            <div className={`glass-card neon-border px-4 py-1.5 rounded-full ${comboMultiplier >= 3 ? "border-neon-pink" : ""}`}>
              <span className={`font-display text-sm font-bold ${comboMultiplier >= 3 ? "text-neon-pink" : "text-accent"}`}>
                🔥 COMBO ×{comboMultiplier}
              </span>
              <span className="text-xs text-muted-foreground ml-2">({combo} ট্যাপ)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bonus event banner */}
      <AnimatePresence>
        {bonusEvent && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="glass-card neon-border-gold px-5 py-2 rounded-full">
              <span className="font-display text-sm font-bold text-accent neon-text-gold">{bonusEvent}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double score indicator */}
      {isDoubleScore && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[5]">
          <div className="w-full h-1 bg-accent/30 rounded-full overflow-hidden" style={{ width: 120 }}>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: DOUBLE_SCORE_DURATION_MS / 1000, ease: "linear" }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      )}

      {/* Moving ball target */}
      <motion.button
        ref={targetRef}
        onClick={handleTap}
        onTouchStart={handleTap}
        animate={{
          left: `${ballPos.x}%`,
          top: `${ballPos.y}%`,
          scale: tapping ? 0.85 : 1,
        }}
        transition={{
          left: { type: "spring", stiffness: 120, damping: 20 },
          top: { type: "spring", stiffness: 120, damping: 20 },
          scale: { duration: 0.06 },
        }}
        className="absolute z-10 -ml-12 -mt-12 w-24 h-24 rounded-full"
        style={{
          background: currentStyle.gradient,
          boxShadow: currentStyle.glow,
        }}
      >
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: ballType === "red" ? "hsl(0 84% 60% / 0.5)" : ballType === "golden" ? "hsl(45 100% 55% / 0.5)" : ballType === "mega" ? "hsl(280 100% 65% / 0.5)" : "hsl(160 100% 50% / 0.5)" }}
        />
        {/* Ball label */}
        {ballType !== "normal" && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-primary-foreground drop-shadow-lg">
            {ballType === "mega" ? "⭐" : ballType === "golden" ? "✦" : "✕"}
          </span>
        )}
      </motion.button>

      {/* Explosion particles */}
      <AnimatePresence>
        {particles.map(p => {
          const rad = (p.angle * Math.PI) / 180;
          const endX = p.x + Math.cos(rad) * p.speed;
          const endY = p.y + Math.sin(rad) * p.speed;
          return (
            <motion.div
              key={p.id}
              initial={{ x: p.x - 3, y: p.y - 3, scale: 1, opacity: 1 }}
              animate={{ x: endX - 3, y: endY - 3, scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed pointer-events-none z-20 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          );
        })}
      </AnimatePresence>

      {/* Floating score texts */}
      <AnimatePresence>
        {floatingTexts.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ x: ft.x - 20, y: ft.y, opacity: 1, scale: 1 }}
            animate={{ y: ft.y - 60, opacity: 0, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`fixed pointer-events-none z-20 font-display text-sm font-bold ${ft.color} whitespace-nowrap`}
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Flying coins to score */}
      <AnimatePresence>
        {flyingCoins.map(coin => {
          const scoreEl = scoreAreaRef.current;
          const endX = scoreEl ? scoreEl.getBoundingClientRect().left + scoreEl.getBoundingClientRect().width / 2 : window.innerWidth / 2;
          const endY = scoreEl ? scoreEl.getBoundingClientRect().top + scoreEl.getBoundingClientRect().height / 2 : 30;
          const style = BALL_STYLES[coin.type];
          return (
            <motion.div
              key={coin.id}
              initial={{ x: coin.startX - 10, y: coin.startY - 10, scale: 1, opacity: 1 }}
              animate={{ x: endX - 10, y: endY - 10, scale: 0.4, opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="fixed pointer-events-none z-20 w-5 h-5 rounded-full shadow-lg"
              style={{ background: style.gradient }}
            />
          );
        })}
      </AnimatePresence>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 pb-2 pt-10 pointer-events-auto z-0">
        <div className="max-w-md mx-auto px-4">
          <BannerAd />
        </div>
        <p className="text-muted-foreground/50 text-xs text-center mt-1">
          ট্যাপ করতে থাকো • {INACTIVITY_TIMEOUT_SECONDS}s নিষ্ক্রিয় থাকলে সেশন শেষ
        </p>
      </div>
    </div>
  );
}
