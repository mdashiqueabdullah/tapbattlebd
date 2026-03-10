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
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { toast } from "sonner";

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
  size?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

interface LionBonus {
  id: number;
  x: number;
  y: number;
  visible: boolean;
}

interface LuckyChest {
  id: number;
  x: number;
  y: number;
  opened: boolean;
  reward: number | null;
  rewardText: string | null;
}

// Constants
const LION_CHANCE = 0.008; // Very rare
const LION_POINTS = 20;
const LION_DURATION_MS = 1800;
const LUCKY_CHEST_CHANCE = 0.012;
const LUCKY_CHEST_DURATION_MS = 2500;
const LUCKY_CHEST_REWARDS = [10, 15, 20, 25, 30];
const COMBO_FRENZY_THRESHOLD = 15;
const FRENZY_DURATION_MS = 6000;

// Simple audio using oscillator
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
  lion: () => { playTone(400, 0.15, "sawtooth", 0.07); setTimeout(() => playTone(600, 0.15, "sawtooth", 0.07), 100); setTimeout(() => playTone(800, 0.15, "triangle", 0.08), 200); setTimeout(() => playTone(1200, 0.25, "triangle", 0.1), 350); },
  lionTap: () => { playTone(800, 0.1, "triangle", 0.1); setTimeout(() => playTone(1200, 0.1, "triangle", 0.1), 80); setTimeout(() => playTone(1600, 0.15, "triangle", 0.1), 160); setTimeout(() => playTone(2000, 0.2, "sine", 0.08), 260); },
  chestAppear: () => { playTone(500, 0.12, "triangle", 0.06); setTimeout(() => playTone(700, 0.1, "triangle", 0.06), 100); },
  chestOpen: () => { playTone(600, 0.08, "sine", 0.08); setTimeout(() => playTone(900, 0.1, "sine", 0.08), 80); setTimeout(() => playTone(1300, 0.15, "sine", 0.08), 160); setTimeout(() => playTone(1600, 0.2, "sine", 0.06), 280); },
  frenzy: () => { playTone(500, 0.1, "square", 0.06); setTimeout(() => playTone(700, 0.1, "square", 0.06), 80); setTimeout(() => playTone(1000, 0.1, "square", 0.06), 160); setTimeout(() => playTone(1400, 0.15, "square", 0.06), 240); setTimeout(() => playTone(1800, 0.2, "sine", 0.08), 340); },
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

  // Lion bonus state
  const [lion, setLion] = useState<LionBonus | null>(null);
  // Lucky chest state
  const [chest, setChest] = useState<LuckyChest | null>(null);
  // Frenzy mode state
  const [isFrenzy, setIsFrenzy] = useState(false);

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
  const lionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chestTimerRef = useRef<NodeJS.Timeout | null>(null);
  const frenzyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lionIdRef = useRef(0);
  const chestIdRef = useRef(0);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) { clearTimeout(inactivityTimerRef.current); inactivityTimerRef.current = null; }
  }, []);

  const endSession = useCallback(() => {
    clearInactivityTimer();
    if (doubleScoreTimerRef.current) clearTimeout(doubleScoreTimerRef.current);
    if (lionTimerRef.current) clearTimeout(lionTimerRef.current);
    if (chestTimerRef.current) clearTimeout(chestTimerRef.current);
    if (frenzyTimerRef.current) clearTimeout(frenzyTimerRef.current);
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
    setLion(null);
    setChest(null);
    setIsFrenzy(false);
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      resetInactivityTimer();
    }
    return () => clearInactivityTimer();
  }, [phase, resetInactivityTimer, clearInactivityTimer]);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 6) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particleIdRef.current += 1;
      newParticles.push({
        id: particleIdRef.current,
        x, y, color,
        angle: (360 / count) * i + Math.random() * 30,
        speed: 40 + Math.random() * 30,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 500);
  }, []);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string, size?: string) => {
    textIdRef.current += 1;
    const id = textIdRef.current;
    setFloatingTexts(prev => [...prev, { id, x, y, text, color, size }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 800);
  }, []);

  // Lion bonus - appears randomly during play
  const trySpawnLion = useCallback(() => {
    if (lion || chest) return; // Don't overlap with chest
    if (Math.random() > LION_CHANCE) return;

    lionIdRef.current += 1;
    const pos = randomPosition();
    const newLion: LionBonus = {
      id: lionIdRef.current,
      x: pos.x,
      y: pos.y,
      visible: true,
    };
    setLion(newLion);
    sounds.lion();

    // Auto-dismiss after duration
    if (lionTimerRef.current) clearTimeout(lionTimerRef.current);
    lionTimerRef.current = setTimeout(() => {
      setLion(null);
    }, LION_DURATION_MS);
  }, [lion, chest]);

  const handleLionTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lion) return;

    sounds.lionTap();
    resetInactivityTimer();

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Big particle burst
    spawnParticles(cx, cy, "hsl(45, 100%, 60%)", 12);
    spawnFloatingText(cx, cy - 40, `+${LION_POINTS}`, "text-neon-gold", "text-2xl");

    const pts = LION_POINTS;
    const newScore = Math.max(0, scoreRef.current + pts);
    scoreRef.current = newScore;
    setScore(newScore);

    if (lionTimerRef.current) clearTimeout(lionTimerRef.current);
    setLion(null);
  }, [lion, resetInactivityTimer, spawnParticles, spawnFloatingText]);

  // Lucky chest - appears randomly
  const trySpawnChest = useCallback(() => {
    if (chest || lion) return;
    if (Math.random() > LUCKY_CHEST_CHANCE) return;

    chestIdRef.current += 1;
    const pos = randomPosition();
    const newChest: LuckyChest = {
      id: chestIdRef.current,
      x: pos.x,
      y: pos.y,
      opened: false,
      reward: null,
      rewardText: null,
    };
    setChest(newChest);
    sounds.chestAppear();

    if (chestTimerRef.current) clearTimeout(chestTimerRef.current);
    chestTimerRef.current = setTimeout(() => {
      setChest(null);
    }, LUCKY_CHEST_DURATION_MS);
  }, [chest, lion]);

  const handleChestTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!chest || chest.opened) return;

    sounds.chestOpen();
    resetInactivityTimer();

    const reward = LUCKY_CHEST_REWARDS[Math.floor(Math.random() * LUCKY_CHEST_REWARDS.length)];

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, "hsl(280, 100%, 65%)", 10);
    spawnFloatingText(cx, cy - 50, `Lucky! +${reward}`, "text-secondary", "text-xl");

    setChest(prev => prev ? { ...prev, opened: true, reward, rewardText: `+${reward}` } : null);

    const newScore = Math.max(0, scoreRef.current + reward);
    scoreRef.current = newScore;
    setScore(newScore);

    // Remove chest after showing reward
    setTimeout(() => setChest(null), 1200);
    if (chestTimerRef.current) clearTimeout(chestTimerRef.current);
  }, [chest, resetInactivityTimer, spawnParticles, spawnFloatingText]);

  // Activate frenzy mode
  const activateFrenzy = useCallback(() => {
    if (isFrenzy) return;
    setIsFrenzy(true);
    sounds.frenzy();
    setBonusEvent("⚡ FRENZY MODE!");

    if (frenzyTimerRef.current) clearTimeout(frenzyTimerRef.current);
    frenzyTimerRef.current = setTimeout(() => {
      setIsFrenzy(false);
      setBonusEvent(null);
    }, FRENZY_DURATION_MS);
  }, [isFrenzy]);

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
    if (currentCombo >= COMBO_FRENZY_THRESHOLD) {
      multiplier = 4;
      activateFrenzy();
    } else if (currentCombo >= COMBO_THRESHOLD_3X) {
      multiplier = 3;
      if (comboMultiplier < 3) sounds.combo();
    } else if (currentCombo >= COMBO_THRESHOLD_2X) {
      multiplier = 2;
      if (comboMultiplier < 2) sounds.combo();
    }
    setComboMultiplier(multiplier);

    const currentType = ballType;
    let basePts = getBallPoints(currentType);

    if (basePts > 0) basePts *= multiplier;
    if (isDoubleScore && basePts > 0) basePts *= 2;
    if (isFrenzy && basePts > 0) basePts = Math.ceil(basePts * 1.5);

    switch (currentType) {
      case "golden": sounds.golden(); break;
      case "red": sounds.red(); break;
      case "mega": sounds.mega(); break;
      default: sounds.tap(); break;
    }

    setTapping(true);
    setTimeout(() => setTapping(false), 80);

    const targetEl = targetRef.current;
    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    const startX = targetRect.left + targetRect.width / 2;
    const startY = targetRect.top + targetRect.height / 2;

    const particleColor = currentType === "golden" ? "hsl(45, 100%, 55%)"
      : currentType === "red" ? "hsl(0, 84%, 60%)"
      : currentType === "mega" ? "hsl(280, 100%, 65%)"
      : "hsl(160, 100%, 50%)";
    spawnParticles(startX, startY, particleColor);

    const textColor = basePts < 0 ? "text-destructive" : currentType === "golden" ? "text-neon-gold" : currentType === "mega" ? "text-secondary" : "text-primary";
    const comboText = multiplier > 1 ? ` ×${multiplier}` : "";
    const doubleText = isDoubleScore && basePts > 0 ? " 🔥" : "";
    const frenzyText = isFrenzy && basePts > 0 ? " ⚡" : "";
    spawnFloatingText(startX, startY - 30, `${basePts > 0 ? "+" : ""}${basePts}${comboText}${doubleText}${frenzyText}`, textColor);

    coinIdRef.current += 1;
    const coinId = coinIdRef.current;
    if (basePts > 0) {
      setFlyingCoins(prev => [...prev, { id: coinId, startX, startY, pts: basePts, type: currentType }]);
    }

    setBallType(pickBallType());

    setTimeout(() => {
      const newScore = Math.max(0, scoreRef.current + basePts);
      scoreRef.current = newScore;
      setScore(newScore);
      setFlyingCoins(prev => prev.filter(c => c.id !== coinId));
    }, basePts > 0 ? 350 : 100);

    // Try spawning lion or chest
    trySpawnLion();
    trySpawnChest();

    // Random bonus event check (only if no frenzy active)
    if (Math.random() < BONUS_EVENT_CHANCE && !bonusEvent && !isFrenzy) {
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
  }, [phase, ballType, isDoubleScore, comboMultiplier, bonusEvent, isFrenzy, resetInactivityTimer, spawnParticles, spawnFloatingText, trySpawnLion, trySpawnChest, activateFrenzy]);

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
          <p className="text-muted-foreground text-xs mb-4">{INACTIVITY_TIMEOUT_SECONDS} সেকেন্ড নিষ্ক্রিয় থাকলে সেশন শেষ</p>
          
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

          {/* Special items */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass-card p-3 text-center">
              <span className="text-3xl">🦁</span>
              <p className="text-xs font-bold text-neon-gold mt-1">+{LION_POINTS} পয়েন্ট</p>
              <p className="text-[10px] text-muted-foreground">লায়ন বোনাস</p>
            </div>
            <div className="glass-card p-3 text-center">
              <span className="text-3xl">🎁</span>
              <p className="text-xs font-bold text-secondary mt-1">+10~30 পয়েন্ট</p>
              <p className="text-[10px] text-muted-foreground">লাকি চেস্ট</p>
            </div>
          </div>

          {/* Combo info */}
          <div className="glass-card p-3 mb-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">🔥 কম্বো সিস্টেম</p>
            <p>{COMBO_THRESHOLD_2X}+ = ×2 • {COMBO_THRESHOLD_3X}+ = ×3 • {COMBO_FRENZY_THRESHOLD}+ = ⚡ ফ্রেঞ্জি!</p>
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
    <div className={`fixed inset-0 z-50 bg-background select-none touch-none overflow-hidden ${isFrenzy ? "frenzy-bg" : ""}`}>
      {/* Frenzy background pulse */}
      {isFrenzy && (
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, hsl(280 100% 65% / 0.2), transparent 70%)" }}
        />
      )}

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
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
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {comboMultiplier > 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-[72px] left-1/2 -translate-x-1/2 z-10"
          >
            <div className={`glass-card neon-border px-4 py-1.5 rounded-full ${
              isFrenzy ? "border-secondary" : comboMultiplier >= 3 ? "border-neon-pink" : ""
            }`}>
              <span className={`font-display text-sm font-bold ${
                isFrenzy ? "text-secondary" : comboMultiplier >= 3 ? "text-neon-pink" : "text-accent"
              }`}>
                {isFrenzy ? "⚡ FRENZY ×4" : `🔥 COMBO ×${comboMultiplier}`}
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
            className="absolute top-[110px] left-1/2 -translate-x-1/2 z-10"
          >
            <div className={`glass-card px-5 py-2 rounded-full ${isFrenzy ? "neon-border" : "neon-border-gold"}`}>
              <span className={`font-display text-sm font-bold ${isFrenzy ? "text-secondary" : "text-accent neon-text-gold"}`}>
                {bonusEvent}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double score indicator */}
      {isDoubleScore && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[5]">
          <div className="h-1 bg-accent/30 rounded-full overflow-hidden" style={{ width: 120 }}>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: DOUBLE_SCORE_DURATION_MS / 1000, ease: "linear" }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      )}

      {/* Frenzy timer bar */}
      {isFrenzy && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[5]">
          <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden" style={{ width: 140 }}>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: FRENZY_DURATION_MS / 1000, ease: "linear" }}
              className="h-full bg-secondary rounded-full"
            />
          </div>
        </div>
      )}

      {/* Fixed center tap target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          ref={targetRef}
          onClick={handleTap}
          onTouchStart={handleTap}
          animate={{ 
            scale: tapping ? 0.85 : 1,
            ...(isFrenzy ? { rotate: [0, 2, -2, 0] } : {}),
          }}
          transition={{ 
            scale: { duration: 0.06 },
            rotate: { duration: 0.3, repeat: Infinity },
          }}
          className="w-24 h-24 rounded-full relative"
          style={{
            background: isFrenzy 
              ? "linear-gradient(135deg, hsl(280 100% 65%), hsl(320 100% 60%), hsl(45 100% 60%))"
              : currentStyle.gradient,
            boxShadow: isFrenzy 
              ? "0 0 40px hsl(280 100% 65% / 0.7), 0 0 80px hsl(320 100% 60% / 0.4)"
              : currentStyle.glow,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: isFrenzy ? 0.5 : 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: isFrenzy ? "hsl(280 100% 65% / 0.6)" : ballType === "red" ? "hsl(0 84% 60% / 0.5)" : ballType === "golden" ? "hsl(45 100% 55% / 0.5)" : ballType === "mega" ? "hsl(280 100% 65% / 0.5)" : "hsl(160 100% 50% / 0.5)" }}
          />
          {ballType !== "normal" && (
            <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-primary-foreground drop-shadow-lg">
              {ballType === "mega" ? "⭐" : ballType === "golden" ? "✦" : "✕"}
            </span>
          )}
        </motion.button>
      </div>

      {/* Lion Bonus */}
      <AnimatePresence>
        {lion && (
          <motion.button
            key={`lion-${lion.id}`}
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={handleLionTap}
            onTouchStart={handleLionTap}
            className="fixed z-30 w-20 h-20 flex items-center justify-center"
            style={{
              left: `${lion.x}%`,
              top: `${lion.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Golden glow aura */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(45 100% 55% / 0.4), transparent 70%)",
                boxShadow: "0 0 30px hsl(45 100% 55% / 0.5), 0 0 60px hsl(45 100% 55% / 0.2)",
              }}
            />
            <span className="text-4xl drop-shadow-lg relative z-10">🦁</span>
            {/* Timer ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
              <motion.circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="hsl(45 100% 55%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={226}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 226 }}
                transition={{ duration: LION_DURATION_MS / 1000, ease: "linear" }}
                style={{ opacity: 0.7 }}
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Lucky Chest */}
      <AnimatePresence>
        {chest && (
          <motion.button
            key={`chest-${chest.id}`}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={handleChestTap}
            onTouchStart={handleChestTap}
            className="fixed z-30 w-18 h-18 flex items-center justify-center"
            style={{
              left: `${chest.x}%`,
              top: `${chest.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-xl"
              style={{
                background: "radial-gradient(circle, hsl(280 100% 65% / 0.3), transparent 70%)",
                boxShadow: "0 0 25px hsl(280 100% 65% / 0.4)",
              }}
            />
            <motion.span
              animate={chest.opened ? { rotateY: 180, scale: 1.2 } : { scale: [1, 1.08, 1] }}
              transition={chest.opened ? { duration: 0.4 } : { duration: 1.2, repeat: Infinity }}
              className="text-4xl drop-shadow-lg relative z-10"
            >
              {chest.opened ? "🎉" : "🎁"}
            </motion.span>
            {/* Reward text */}
            {chest.opened && chest.rewardText && (
              <motion.div
                initial={{ y: 0, opacity: 1, scale: 0.8 }}
                animate={{ y: -30, opacity: 0, scale: 1.3 }}
                transition={{ duration: 1 }}
                className="absolute top-0 font-display text-lg font-bold text-secondary whitespace-nowrap"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              >
                Lucky! {chest.rewardText}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

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
            className={`fixed pointer-events-none z-20 font-display font-bold ${ft.size || "text-sm"} ${ft.color} whitespace-nowrap`}
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
