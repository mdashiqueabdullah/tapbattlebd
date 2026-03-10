import { useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TapEvent {
  timestamp: number;
  ball_type: string;
  points: number;
  multiplier: number;
}

interface AntiCheatSession {
  sessionToken: string | null;
  sessionId: string | null;
  tapEvents: TapEvent[];
  visibilityChanges: number;
  focusLosses: number;
  startTime: number;
  isActive: boolean;
}

export function useAntiCheat() {
  const sessionRef = useRef<AntiCheatSession>({
    sessionToken: null,
    sessionId: null,
    tapEvents: [],
    visibilityChanges: 0,
    focusLosses: 0,
    startTime: 0,
    isActive: false,
  });

  // Track visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      if (sessionRef.current.isActive && document.hidden) {
        sessionRef.current.visibilityChanges += 1;
      }
    };
    const handleBlur = () => {
      if (sessionRef.current.isActive) {
        sessionRef.current.focusLosses += 1;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const startSession = useCallback(async (isPractice: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("start-session", {
        body: {
          is_practice: isPractice,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (error) {
        return { success: false, error: "Session start failed" };
      }

      sessionRef.current = {
        sessionToken: data.session_token,
        sessionId: data.session_id,
        tapEvents: [],
        visibilityChanges: 0,
        focusLosses: 0,
        startTime: Date.now(),
        isActive: true,
      };

      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const recordTap = useCallback((ballType: string, points: number, multiplier: number) => {
    if (!sessionRef.current.isActive) return;

    sessionRef.current.tapEvents.push({
      timestamp: Date.now(),
      ball_type: ballType,
      points,
      multiplier,
    });
  }, []);

  const submitScore = useCallback(async (clientScore: number): Promise<{
    success: boolean;
    verifiedScore?: number;
    flagged?: boolean;
    error?: string;
  }> => {
    if (!sessionRef.current.sessionToken) {
      return { success: false, error: "No active session" };
    }

    try {
      const { data, error } = await supabase.functions.invoke("submit-score", {
        body: {
          session_token: sessionRef.current.sessionToken,
          client_score: clientScore,
          tap_count: sessionRef.current.tapEvents.length,
          tap_events: sessionRef.current.tapEvents,
          visibility_changes: sessionRef.current.visibilityChanges,
          focus_losses: sessionRef.current.focusLosses,
          duration_ms: Date.now() - sessionRef.current.startTime,
        },
      });

      sessionRef.current.isActive = false;

      if (error) {
        return { success: false, error: "Score submission failed" };
      }

      return {
        success: true,
        verifiedScore: data.verified_score,
        flagged: data.flagged,
      };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  return { startSession, recordTap, submitScore };
}
