import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

const ACCENT = "#5ecba1";
const BG = "#edfaf5";
const DARK = "#1a3d35";
const SOFT = "#a8e4cc";

const PHASE_SECONDS = 4;
const PHASES = [
  { key: "in", label: "Breathe in", scale: 1.0 },
  { key: "hold", label: "Hold", scale: 1.0 },
  { key: "out", label: "Breathe out", scale: 0.55 },
] as const;
const CYCLE_SECONDS = PHASE_SECONDS * PHASES.length;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const MeditationSession = (): JSX.Element => {
  const [, setLocation] = useLocation();

  const totalSecondsRef = useRef<number>(
    (() => {
      const raw = Number(localStorage.getItem("meditationDuration"));
      const allowed = [1, 3, 5];
      const minutes = allowed.includes(raw) ? raw : 3;
      return minutes * 60;
    })()
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSecondsRef.current);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const navigatedRef = useRef(false);

  // Mark a fresh session id so completion can award XP exactly once
  useEffect(() => {
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("meditationSessionId", sessionId);
    localStorage.removeItem("meditationAwardedFor");
  }, []);

  // Countdown timer (1s tick)
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (!navigatedRef.current) {
            navigatedRef.current = true;
            const cycles = Math.max(1, Math.floor(totalSecondsRef.current / CYCLE_SECONDS));
            localStorage.setItem(
              "meditationStats",
              JSON.stringify({ totalSeconds: totalSecondsRef.current, cycles })
            );
            setTimeout(() => setLocation("/meditation/complete"), 200);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [setLocation]);

  // Phase cycler (PHASE_SECONDS each)
  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((p) => (p + 1) % PHASES.length);
    }, PHASE_SECONDS * 1000);
    return () => clearInterval(id);
  }, []);

  const currentPhase = PHASES[phaseIndex];
  const progressPct = ((totalSecondsRef.current - secondsLeft) / totalSecondsRef.current) * 100;

  return (
    <MobileShell>
      <StatusBar />

      {/* Header with close + timer */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/home")}
          data-testid="button-close"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <X size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div
          className="px-4 py-[6px] rounded-full"
          style={{ background: BG, border: `1.5px solid ${ACCENT}` }}
          data-testid="text-timer"
        >
          <span
            className="text-[16px] font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: DARK }}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>

        <div className="w-[42px]" />
      </div>

      {/* Progress bar */}
      <div className="px-4 flex-shrink-0">
        <div className="w-full h-[6px] rounded-full bg-[#e0f0e8] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: ACCENT }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </div>

      {/* Breathing circle */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(circle at center, ${BG} 0%, white 70%)` }}
      >
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          {/* Outer halo ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              background: SOFT,
              opacity: 0.25,
            }}
            animate={{ scale: currentPhase.scale * 0.95 + 0.05 }}
            transition={{ duration: PHASE_SECONDS, ease: "easeInOut" }}
          />

          {/* Inner solid circle — starts at the exhaled scale so first inhale visibly expands */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 220,
              height: 220,
              background: ACCENT,
              boxShadow: `0px 6px 0px ${DARK}33`,
            }}
            initial={{ scale: 0.55 }}
            animate={{ scale: currentPhase.scale }}
            transition={{ duration: PHASE_SECONDS, ease: "easeInOut" }}
            data-testid="breathing-circle"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPhase.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="text-white text-[24px] font-bold tracking-[0.5px]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-phase-label"
              >
                {currentPhase.label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        <p
          className="text-[#595c5d] text-[14px] mt-12 text-center px-8 leading-[20px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Follow the circle. Match your breath to its rhythm.
        </p>
      </div>

      <HomeIndicator />
    </MobileShell>
  );
};
