import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { X, Share2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { advanceToNextSubject } from "@/lib/quizData";
import { queryClient } from "@/lib/queryClient";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const ACCENT = "#f0a030";
const ACCENT_SHADOW = "#c97d10";

interface RebusResultData {
  topic: string;
  correct: number;
  total: number;
  xp: number;
  completedAt: string;
}

function getMessage(correct: number, total: number) {
  const pct = correct / total;
  if (pct === 1) return { title: "🏆 PERFECT!", sub: "You cracked every single one!" };
  if (pct >= 0.7) return { title: "🎉 GREAT JOB!", sub: "Emoji detective skills unlocked!" };
  if (pct >= 0.4) return { title: "👍 GOOD EFFORT!", sub: "Every rebus makes you sharper." };
  return { title: "🧩 KEEP GOING!", sub: "These puzzles get easier with practice." };
}

export const RebusComplete = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const awarded = useRef(false);

  const results = (() => {
    try {
      const raw = localStorage.getItem("rebusResults");
      return raw ? (JSON.parse(raw) as RebusResultData) : null;
    } catch {
      return null;
    }
  })();

  const correct = results?.correct ?? 0;
  const total = results?.total ?? 6;
  const xp = results?.xp ?? 0;
  const topic = results?.topic ?? "General Knowledge";
  const completedAt = results?.completedAt ?? "";

  const { title, sub } = getMessage(correct, total);

  useEffect(() => {
    if (awarded.current) return;
    const awardKey = `rebusXpAwarded_${completedAt}`;
    const alreadyAwarded = localStorage.getItem(awardKey);
    if (alreadyAwarded || !completedAt || xp <= 0) return;
    awarded.current = true;

    advanceToNextSubject();

    fetch("/api/xp/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: xp }),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(awardKey, "1");
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      })
      .catch(() => {});

    fetch("/api/activity/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ activityType: "rebus", durationSeconds: total * 25 }),
    })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/stats"] }))
      .catch(() => {});
  }, [xp, completedAt, total]);

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        {...fadeUp(0.05)}
      >
        <div style={{ width: 42 }} />
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>🧩</span>
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Emoji Rebus
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

      {/* Blinky */}
      <motion.div
        className="flex justify-center mt-6 mb-2 flex-shrink-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
      >
        <div className="relative">
          <motion.div
            className="absolute text-[22px]"
            style={{ top: -10, left: -18 }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-[16px]"
            style={{ top: -6, right: -14 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            🧩
          </motion.div>
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            style={{ width: 110 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Result text */}
      <motion.div className="flex flex-col items-center px-6 flex-shrink-0" {...fadeUp(0.18)}>
        <h1
          className="text-[30px] font-bold text-[#282145] text-center leading-[38px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-result-title"
        >
          {title}
        </h1>
        <p
          className="text-[#595c5d] text-[16px] text-center mt-2 leading-[24px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
          data-testid="text-score"
        >
          You solved{" "}
          <span className="font-bold text-[#282145]">{correct}/{total}</span>{" "}
          emoji puzzles about{" "}
          <span className="font-bold text-[#282145]">{topic}</span>!
        </p>
        <p
          className="text-[#9FA9BB] text-[14px] text-center mt-2 leading-[20px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {sub}
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="flex gap-4 px-4 mt-6 flex-shrink-0" {...fadeUp(0.26)}>
        <div
          className="flex-1 rounded-[24px] p-5 flex flex-col gap-3"
          style={{ background: "#fff8e6" }}
          data-testid="card-xp"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: ACCENT }}
          >
            <span className="text-[24px]">🧩</span>
          </div>
          <div>
            <p
              className="text-[22px] font-bold leading-[28px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#22c55e" }}
              data-testid="text-xp"
            >
              +{xp} XP
            </p>
            <p
              className="text-[#595c5d] text-[13px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Decoded
            </p>
          </div>
        </div>

        <div
          className="flex-1 rounded-[24px] p-5 flex flex-col gap-3"
          style={{ background: "#282145" }}
          data-testid="card-score"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: ACCENT }}
          >
            <span className="text-[24px]">🏅</span>
          </div>
          <div>
            <p
              className="text-white text-[22px] font-bold leading-[28px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-score-count"
            >
              {correct}/{total}
            </p>
            <p
              className="text-[#9FA9BB] text-[13px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Correct
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* CTA */}
      <motion.div className="px-4 mt-5 pb-6 flex-shrink-0" {...fadeUp(0.34)}>
        <button
          data-testid="button-back-to-games"
          onClick={() => setLocation("/home")}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center gap-3"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-white text-[20px] font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Back to games
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
