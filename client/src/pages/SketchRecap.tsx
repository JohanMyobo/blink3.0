import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Paintbrush, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getStoredPrompt } from "@/lib/prompts";
import type { Sketch } from "@shared/schema";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

function scoreToXP(score: number): { xp: number; label: string; color: string } {
  if (score >= 91) return { xp: 60, label: "Perfect!", color: "#8174e0" };
  if (score >= 71) return { xp: 40, label: "Great!", color: "#22c55e" };
  if (score >= 41) return { xp: 25, label: "Good!", color: "#f0c040" };
  return { xp: 10, label: "Keep going!", color: "#9FA9BB" };
}

const BLINKY_PHRASES: Record<"perfect" | "great" | "good" | "practice", string[]> = {
  perfect: [
    "Wow, I can totally see it!",
    "That's a masterpiece!",
    "Are you secretly a pro artist?",
    "Nailed it! Frame-worthy!",
  ],
  great: [
    "Hey, that's really good!",
    "I knew what it was right away!",
    "Pretty impressive work!",
    "You've got a talent for this!",
  ],
  good: [
    "Not bad at all!",
    "I can see what you were going for!",
    "Getting better every time!",
    "Keep it up — you're on the right track!",
  ],
  practice: [
    "Hmm, keep practising!",
    "Every artist starts somewhere!",
    "Don't give up — you'll get there!",
    "The pen is mightier… with more practice!",
  ],
};

function getBlinkyPhrase(score: number): string {
  let tier: keyof typeof BLINKY_PHRASES;
  if (score >= 91) tier = "perfect";
  else if (score >= 71) tier = "great";
  else if (score >= 41) tier = "good";
  else tier = "practice";
  const phrases = BLINKY_PHRASES[tier];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function BlinkyReaction({ score }: { score: number }) {
  const phrase = useRef(getBlinkyPhrase(score)).current;
  return (
    <motion.div
      className="flex items-end gap-3 px-4 mt-4 flex-shrink-0"
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.7 }}
      data-testid="blinky-reaction"
    >
      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="59" viewBox="0 0 115 105" fill="none">
          <path d="M96.0022 80.0852C74.7891 107.701 14.306 91.2121 9.60208 56.7644C7.19027 39.1024 14.881 29.7446 25.6402 14.0141C43.2073 -8.32694 52.9197 18.7078 65.4249 22.0832C76.6175 25.1042 97.7736 6.08498 103.173 34.9414C104.738 52.891 106.895 65.9044 96.0022 80.0852Z" fill="#8174E0"/>
          <ellipse cx="12.9751" cy="12.9083" rx="12.9751" ry="12.9083" transform="matrix(0.965449 0.260591 -0.26281 0.964848 66.2873 35.3721)" fill="#FFFFFE"/>
          <ellipse cx="12.9751" cy="12.9083" rx="12.9751" ry="12.9083" transform="matrix(0.965449 0.260591 -0.26281 0.964848 32.4645 26.2429)" fill="#FFFFFE"/>
          <ellipse cx="9.58854" cy="9.53916" rx="9.58854" ry="9.53916" transform="matrix(0.965449 0.260591 -0.26281 0.964848 36.1476 30.5871)" fill="#433877"/>
          <ellipse cx="9.58854" cy="9.53916" rx="9.58854" ry="9.53916" transform="matrix(0.965449 0.260591 -0.26281 0.964848 67.0558 39.3502)" fill="#433877"/>
          <path d="M46.9543 65.4988C49.5161 70.2691 54.4616 71.604 58.6437 68.654" stroke="#433877" strokeWidth="9.88689" strokeLinecap="round"/>
        </svg>
      </div>

      <motion.div
        className="relative flex-1 rounded-[18px] px-4 py-3"
        style={{ background: "#f0f1fd", border: "1.5px solid #c8c4f0" }}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.85 }}
      >
        <div
          className="absolute left-[-9px] bottom-4 w-0 h-0"
          style={{
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "9px solid #c8c4f0",
          }}
        />
        <div
          className="absolute left-[-7px] bottom-[17px] w-0 h-0"
          style={{
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderRight: "8px solid #f0f1fd",
          }}
        />
        <span
          className="text-[13px] font-semibold text-[#282145] leading-snug"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-blinky-phrase"
        >
          {phrase}
        </span>
      </motion.div>
    </motion.div>
  );
}

function useCountUp(target: number, duration = 1000, enabled = true) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  useEffect(() => {
    if (!enabled || target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, enabled]);
  return value;
}

export const SketchRecap = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [sketchId, setSketchId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const hasAnalysed = useRef(false);

  useEffect(() => {
    setSketchId(localStorage.getItem("lastSketchId"));
  }, []);

  const { data: sketch, isLoading } = useQuery<Sketch>({
    queryKey: ["/api/sketches", sketchId],
    enabled: !!sketchId,
  });

  const xpAwardedRef = useRef(false);

  const fallbackDataUrl = typeof window !== "undefined"
    ? localStorage.getItem("sketchDataUrl")
    : null;
  const fallbackStats = (() => {
    try {
      const s = localStorage.getItem("sketchStats");
      return s ? JSON.parse(s) : { strokeCount: 0, timeElapsed: 0 };
    } catch { return { strokeCount: 0, timeElapsed: 0 }; }
  })();
  const fallbackPrompt = getStoredPrompt();

  const dataUrl = sketch?.dataUrl ?? fallbackDataUrl;
  const strokeCount = sketch?.strokeCount ?? fallbackStats.strokeCount;
  const timeElapsed = sketch?.timeElapsed ?? fallbackStats.timeElapsed;
  const promptWord = sketch?.prompt ?? fallbackPrompt?.word ?? null;

  // Trigger analysis once we have both dataUrl and promptWord
  useEffect(() => {
    if (hasAnalysed.current) return;
    if (!dataUrl || !promptWord) return;
    hasAnalysed.current = true;

    // Check for a cached score first
    const cacheKey = sketchId ? `sketchScore_${sketchId}` : null;
    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached !== null) {
        const cachedScore = Number(cached);
        if (!isNaN(cachedScore)) {
          setScore(cachedScore);
          return;
        }
      }
    }

    setIsAnalysing(true);

    fetch("/api/sketch/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl, prompt: promptWord }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const s = typeof data.score === "number" ? data.score : null;
        if (s === null) throw new Error("No score in response");
        setScore(s);
        if (cacheKey) {
          localStorage.setItem(cacheKey, String(s));
        }
        if (!xpAwardedRef.current) {
          xpAwardedRef.current = true;
          const { xp: earnedXp } = scoreToXP(s);
          fetch("/api/xp/award", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: earnedXp }),
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }))
            .catch(() => {});
          fetch("/api/activity/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ activityType: "sketch", durationSeconds: Math.round(timeElapsed) }),
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/stats"] }))
            .catch(() => {});
        }
      })
      .catch(() => {
        setAnalysisError(true);
        if (!xpAwardedRef.current) {
          xpAwardedRef.current = true;
          fetch("/api/xp/award", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 20 }),
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }))
            .catch(() => {});
          fetch("/api/activity/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ activityType: "sketch", durationSeconds: Math.round(timeElapsed) }),
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/stats"] }))
            .catch(() => {});
        }
      })
      .finally(() => setIsAnalysing(false));
  }, [dataUrl, promptWord, sketchId]);

  const displayScore = score ?? 0;
  const { xp, label, color } = scoreToXP(score ?? 0);
  const animatedScore = useCountUp(displayScore, 1200, score !== null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec.toString().padStart(2, "0")}s`;
  };

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        {...fadeUp(0.05)}
      >
        <button
          onClick={() => setLocation("/game/sketch")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <Paintbrush size={22} color="#282145" strokeWidth={2} />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Quick Sketch
          </span>
        </div>

        <button
          onClick={() => setLocation("/home")}
          data-testid="button-close"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <X size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>

      {/* Drawing thumbnail */}
      <motion.div className="px-4 mt-3 flex-shrink-0" {...fadeUp(0.12)}>
        <div
          className="w-full rounded-[32px] bg-white overflow-hidden flex items-center justify-center"
          style={{
            height: 148,
            border: "1px solid rgba(171,173,174,0.1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 opacity-30 animate-pulse">
              <Paintbrush size={40} color="#282145" />
            </div>
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="Your sketch"
              data-testid="img-sketch-result"
              className="w-full h-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Paintbrush size={40} color="#282145" />
              <span
                className="text-[#282145] text-[14px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                No drawing found
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Prompt chip */}
      {promptWord && (
        <motion.div className="flex justify-center mt-3 flex-shrink-0" {...fadeUp(0.16)}>
          <div
            className="flex items-center gap-2 px-4 py-[6px] rounded-full"
            style={{ background: "#f0f1fd", border: "1.5px solid #8174e0" }}
          >
            <span
              className="text-[#595c5d] text-[13px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              You drew:
            </span>
            <span
              className="text-[#282145] text-[14px] font-bold"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-recap-prompt"
            >
              {promptWord}
            </span>
          </div>
        </motion.div>
      )}

      {/* AI Accuracy Score Card */}
      <motion.div className="px-4 mt-4 flex-shrink-0" {...fadeUp(0.2)}>
        <div
          className="w-full rounded-[24px] p-5"
          style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[14px] font-semibold text-[#282145]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Accuracy Score
            </p>

            <AnimatePresence mode="wait">
              {isAnalysing ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    className="w-4 h-4 border-2 rounded-full"
                    style={{ borderColor: "#e0ddf8", borderTopColor: "#8174e0" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  />
                  <span
                    className="text-[12px] text-[#9FA9BB]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Analysing…
                  </span>
                </motion.div>
              ) : score !== null ? (
                <motion.div
                  key="score"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-baseline gap-1"
                >
                  <span
                    className="text-[26px] font-bold leading-none"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color }}
                    data-testid="text-accuracy-score"
                  >
                    {animatedScore}
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif", color: "#9FA9BB" }}
                  >
                    / 100
                  </span>
                </motion.div>
              ) : analysisError ? (
                <motion.span
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[12px] text-[#9FA9BB]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  —
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full h-[10px] rounded-full bg-[#f0f1fd] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: score !== null ? color : "#e0ddf8" }}
              initial={{ width: "0%" }}
              animate={{ width: score !== null ? `${displayScore}%` : isAnalysing ? "8%" : "0%" }}
              transition={{ duration: 1.2, ease: [0.34, 1.2, 0.64, 1], delay: 0.1 }}
            />
          </div>

          {/* XP reward row */}
          <AnimatePresence>
            {(score !== null || analysisError) && !isAnalysing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex items-center justify-between mt-3"
              >
                {analysisError ? (
                  <span
                    className="text-[13px] font-semibold text-[#9FA9BB]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    data-testid="text-score-label"
                  >
                    Nice try!
                  </span>
                ) : (
                  <span
                    className="text-[13px] font-semibold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color }}
                    data-testid="text-score-label"
                  >
                    {label}
                  </span>
                )}
                <span
                  className="text-[15px] font-bold"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#22c55e" }}
                  data-testid="text-sketch-xp"
                >
                  + {analysisError ? 20 : xp} XP
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Blinky reaction */}
      <AnimatePresence>
        {score !== null && !isAnalysing && (
          <BlinkyReaction score={score} />
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="flex gap-4 px-4 mt-4 flex-shrink-0">
        <motion.div
          className="flex-1 bg-white rounded-[24px] p-4 flex flex-col gap-2"
          style={{ border: "1px solid rgba(171,173,174,0.1)" }}
          {...fadeUp(0.26)}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "#b0b2f1" }}
          >
            <span className="text-[22px]">⏱️</span>
          </div>
          <div>
            <p
              className="text-[#282145] text-[17px] font-bold leading-[22px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-time-elapsed"
            >
              {formatTime(timeElapsed)}
            </p>
            <p
              className="text-[#595c5d] text-[12px] font-normal tracking-[0.5px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Time used
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 bg-white rounded-[24px] p-4 flex flex-col gap-2"
          style={{ border: "1px solid rgba(171,173,174,0.1)" }}
          {...fadeUp(0.3)}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "#a6f687" }}
          >
            <span className="text-[22px]">✏️</span>
          </div>
          <div>
            <p
              className="text-[#282145] text-[17px] font-bold leading-[22px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-stroke-count"
            >
              {strokeCount} strokes
            </p>
            <p
              className="text-[#595c5d] text-[12px] font-normal tracking-[0.5px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Brushstrokes made
            </p>
          </div>
        </motion.div>
      </div>

      {/* Continue */}
      <motion.div className="px-4 mt-4 flex-shrink-0" {...fadeUp(0.36)}>
        <button
          data-testid="button-continue"
          onClick={() => setLocation("/home")}
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Continue
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
