import { useEffect, useState, useMemo } from "react";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { X, Zap, Share2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { advanceToNextSubject } from "@/lib/quizData";
import { queryClient } from "@/lib/queryClient";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const CONFETTI_COLORS = ["#8174e0", "#282145", "#f0c040", "#f06090", "#40d090", "#60a0f0", "#f0f1fd"];
const CONFETTI_COUNT = 48;

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const ConfettiBurst = () => {
  const pieces = useMemo(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const r = (n: number) => seededRandom(i * 7 + n);
      return {
        id: i,
        x: r(0) * 360 - 40,
        xEnd: r(1) * 420 - 50,
        y: -20,
        yEnd: 820 + r(2) * 200,
        rotate: r(3) * 720 - 360,
        size: 7 + r(4) * 8,
        color: CONFETTI_COLORS[Math.floor(r(5) * CONFETTI_COLORS.length)],
        delay: r(6) * 0.55,
        duration: 1.6 + r(0) * 1.2,
        isCircle: r(3) > 0.5,
      };
    }), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.xEnd - p.x,
            y: p.yEnd,
            rotate: p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.2, 0.8, 0.6, 1],
            opacity: { times: [0, 0.6, 0.8, 1], duration: p.duration, delay: p.delay },
          }}
        />
      ))}
    </div>
  );
};

interface QuizResultData {
  quizId: string;
  quizTitle: string;
  quizEmoji: string;
  correct: number;
  total: number;
  xp: number;
  completedAt: string;
}

export const QuizResults = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<QuizResultData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("quizResults");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResults(parsed);
        if (parsed?.quizId === "generated") {
          advanceToNextSubject();
        }

        const awardKey = `quizXpAwarded_${parsed?.quizId}_${parsed?.completedAt}`;
        const alreadyAwarded = localStorage.getItem(awardKey);
        if (!alreadyAwarded && parsed?.xp > 0) {
          fetch("/api/xp/award", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: parsed.xp }),
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
            body: JSON.stringify({ activityType: "quiz", durationSeconds: 120 }),
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/stats"] }))
            .catch(() => {});
        }
      } catch {}
    }
  }, []);

  const correct = results?.correct ?? 0;
  const total = results?.total ?? 10;
  const xp = results?.xp ?? 0;
  const title = results?.quizTitle ?? "Egyptian Gods";
  const emoji = results?.quizEmoji ?? "🐪";

  const showConfetti = correct / total >= 0.7;

  return (
    <MobileShell>
      {showConfetti && <ConfettiBurst />}
      <StatusBar />

      {/* Header — no back button */}
      <motion.div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        {...fadeUp(0.05)}
      >
        <div className="w-[42px]" />

        <div className="flex items-center gap-2">
          <Zap size={22} color="#282145" strokeWidth={2} fill="#282145" />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Quick Quizz
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

      {/* Blinky + sparkles */}
      <motion.div
        className="flex flex-col items-center mt-6 mb-2 flex-shrink-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
      >
        <div className="relative">
          {/* Sparkles */}
          <motion.div
            className="absolute text-[#8174e0] text-[22px]"
            style={{ top: -10, left: -18 }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-[#8174e0] text-[16px]"
            style={{ top: -6, right: -14 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-[#8174e0] text-[12px]"
            style={{ top: 12, right: -22 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            ✨
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

      {/* Well done */}
      <motion.div className="flex flex-col items-center px-6 flex-shrink-0" {...fadeUp(0.18)}>
        <h1
          className="text-[32px] font-bold text-[#282145] text-center leading-[40px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-well-done"
        >
          🎉 WELL DONE!
        </h1>
        <p
          className="text-[#595c5d] text-[17px] text-center mt-2 leading-[24px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
          data-testid="text-score"
        >
          You got{" "}
          <span className="font-bold text-[#282145]">
            {correct}/{total}
          </span>{" "}
          questions!
        </p>
        <p
          className="text-[#595c5d] text-[15px] text-center mt-3 leading-[22px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          In just a few minutes, you explored ancient myths and{" "}
          <span className="font-bold text-[#282145]">learned something new</span>.
        </p>
        <p
          className="text-[#282145] text-[15px] font-bold text-center mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          A few minutes well spent.
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="flex gap-4 px-4 mt-6 flex-shrink-0" {...fadeUp(0.26)}>
        {/* XP card */}
        <div
          className="flex-1 rounded-[24px] p-5 flex flex-col gap-3"
          style={{ background: "#f0f1fd" }}
          data-testid="card-xp"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: "#8174e0" }}
          >
            <span className="text-[24px]">✨</span>
          </div>
          <div>
            <p
              className="text-[22px] font-bold leading-[28px]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                color: "#22c55e",
              }}
              data-testid="text-xp"
            >
              + {xp} XP
            </p>
            <p
              className="text-[#595c5d] text-[13px] font-normal tracking-[0.5px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Learned
            </p>
          </div>
        </div>

        {/* Streak card */}
        <div
          className="flex-1 rounded-[24px] p-5 flex flex-col gap-3"
          style={{ background: "#282145" }}
          data-testid="card-streak"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: "#8174e0" }}
          >
            <Zap size={26} color="white" fill="white" />
          </div>
          <div>
            <p
              className="text-white text-[22px] font-bold leading-[28px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-streak"
            >
              1 DAY
            </p>
            <p
              className="text-[#9FA9BB] text-[13px] font-normal tracking-[0.5px] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Keep winning !
            </p>
          </div>
        </div>
      </motion.div>

      {/* Push share button to bottom */}
      <div className="flex-1" />

      {/* Share button */}
      <motion.div className="px-4 mt-5 pb-6 flex-shrink-0" {...fadeUp(0.34)}>
        <button
          data-testid="button-share-victory"
          onClick={() => setLocation("/home")}
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center gap-3"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          <Share2 size={22} color="white" strokeWidth={2} />
          <span
            className="text-white text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Share Victory
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
