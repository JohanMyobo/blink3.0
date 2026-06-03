import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wind, Sparkles, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const ACCENT = "#5ecba1";
const BG = "#edfaf5";
const DARK = "#1a3d35";

function minutesToXp(min: number): number {
  if (min >= 5) return 50;
  if (min >= 3) return 30;
  return 15;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export const MeditationComplete = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const stats = (() => {
    try {
      const raw = localStorage.getItem("meditationStats");
      return raw ? JSON.parse(raw) : { totalSeconds: 180, cycles: 15 };
    } catch {
      return { totalSeconds: 180, cycles: 15 };
    }
  })() as { totalSeconds: number; cycles: number };

  const minutes = Math.max(1, Math.round(stats.totalSeconds / 60));
  const xp = minutesToXp(minutes);

  const [streak, setStreak] = useState<number | null>(null);

  const awarded = useRef(false);
  useEffect(() => {
    if (awarded.current) return;
    // Only award XP / record session once per completed session — guard against route revisits
    const sessionId = localStorage.getItem("meditationSessionId");
    const alreadyAwardedFor = localStorage.getItem("meditationAwardedFor");
    if (!sessionId || alreadyAwardedFor === sessionId) {
      awarded.current = true;
      // Still fetch the latest streak so the UI shows it on revisits
      fetch("/api/meditation/recent", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.streak === "number") setStreak(data.streak);
        })
        .catch(() => {});
      return;
    }
    awarded.current = true;
    localStorage.setItem("meditationAwardedFor", sessionId);
    fetch("/api/xp/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: xp }),
    })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }))
      .catch(() => {});
    fetch("/api/meditation/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ durationSeconds: stats.totalSeconds }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.streak === "number") setStreak(data.streak);
        queryClient.invalidateQueries({ queryKey: ["/api/meditation/recent"] });
      })
      .catch(() => {});
    fetch("/api/activity/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ activityType: "meditation", durationSeconds: stats.totalSeconds }),
    })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/stats"] }))
      .catch(() => {});
  }, [xp, queryClient, stats.totalSeconds]);

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-center px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Wind size={22} color={ACCENT} strokeWidth={2.5} />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Breathe
          </span>
        </div>
      </div>

      {/* Blinky + speech */}
      <motion.div
        className="flex flex-col items-center justify-center px-4 mt-6 flex-shrink-0"
        {...fadeUp(0.1)}
      >
        <motion.div
          className="flex flex-col items-center mb-2"
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.3 }}
        >
          <div
            className="px-5 py-3 rounded-2xl flex items-center justify-center"
            style={{ background: BG, border: `2px solid ${ACCENT}`, boxShadow: `0px 3px 0px ${ACCENT}` }}
          >
            <p
              className="text-[16px] font-semibold text-center tracking-[0.3px] leading-[22px]"
              style={{ fontFamily: "'Inter', sans-serif", color: DARK }}
              data-testid="text-blinky-celebration"
            >
              You did it! 🧘‍♀️
            </p>
          </div>
          <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `12px solid ${ACCENT}` }} />
        </motion.div>

        <motion.img
          src={blinkySvg}
          alt="Blinky"
          style={{ width: 140 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          data-testid="img-blinky"
        />
      </motion.div>

      {/* Stats card */}
      <motion.div className="px-4 mt-6 flex-shrink-0" {...fadeUp(0.22)}>
        <div
          className="w-full rounded-[24px] p-5"
          style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[14px] font-semibold"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: DARK }}
            >
              Session complete
            </span>
            <div className="flex items-center gap-1">
              <Sparkles size={14} color="#22c55e" strokeWidth={2.5} />
              <span
                className="text-[15px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#22c55e" }}
                data-testid="text-meditation-xp"
              >
                + {xp} XP
              </span>
            </div>
          </div>

          {streak !== null && streak > 0 && (
            <div
              className="flex items-center justify-center gap-2 mb-3 py-2 rounded-[16px]"
              style={{ background: "#fff4e6", border: "1.5px solid #ffd9a8" }}
              data-testid="meditation-streak-banner"
            >
              <Flame size={16} color="#f97316" strokeWidth={2.5} />
              <span
                className="text-[14px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#c2410c" }}
                data-testid="text-meditation-streak"
              >
                {streak} day{streak === 1 ? "" : "s"} streak
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <div
              className="flex-1 rounded-[18px] py-3 flex flex-col items-center"
              style={{ background: BG }}
            >
              <span
                className="text-[20px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: DARK }}
                data-testid="text-stat-time"
              >
                {formatTime(stats.totalSeconds)}
              </span>
              <span
                className="text-[11px] mt-1 tracking-[0.5px]"
                style={{ fontFamily: "'Inter', sans-serif", color: "#595c5d" }}
              >
                Time
              </span>
            </div>
            <div
              className="flex-1 rounded-[18px] py-3 flex flex-col items-center"
              style={{ background: BG }}
            >
              <span
                className="text-[20px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: DARK }}
                data-testid="text-stat-cycles"
              >
                {stats.cycles}
              </span>
              <span
                className="text-[11px] mt-1 tracking-[0.5px]"
                style={{ fontFamily: "'Inter', sans-serif", color: "#595c5d" }}
              >
                Breaths
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* Done button */}
      <motion.div className="flex-shrink-0 px-4 pt-6 pb-2" {...fadeUp(0.4)}>
        <button
          data-testid="button-done"
          onClick={() => setLocation("/home")}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Done
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
