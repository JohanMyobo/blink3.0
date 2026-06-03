import { useState } from "react";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

const GOALS = [
  { emoji: "😵‍💫", label: "Limit Doomscrolling" },
  { emoji: "🧠", label: "Learn something" },
  { emoji: "😌", label: "Relax my mind" },
  { emoji: "⚡", label: "Boost my energy" },
  { emoji: "🎯", label: "Stay focused" },
  { emoji: "🎮", label: "Have Fun" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const GoalSelection = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <MobileShell>
      <StatusBar />
      {/* Header: back button */}
      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/intro")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>
      {/* Blinky + speech bubble row */}
      <motion.div
        className="flex-shrink-0 flex items-center justify-between px-4 mt-3"
        {...fadeUp(0.12)}
      >
        {/* Speech bubble — left, rounded tail pointing right */}
        <div className="flex items-center">
          <div
            className="bg-[#f0f1fd] border-2 border-[#8174e0] rounded-xl px-4 py-3 flex items-center justify-center"
            style={{
              width: 190,
              boxShadow: "3px 0px 0px #8174e0",
            }}
          >
            <p
              className="text-[#282145] text-[15px] font-semibold text-center tracking-[0.5px] leading-[22px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              What's your goal?
            </p>
          </div>

          {/* Right-pointing spike */}
          <div className="relative flex flex-col justify-center" style={{ width: 14, height: 30 }}>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2 Q2 2 12 10 Q2 18 2 18 Q0 18 0 16 L0 4 Q0 2 2 2Z" fill="#8174e0" />
            </svg>
          </div>
        </div>

        {/* Blinky — right side, tilted */}
        <motion.img
          src={blinkySvg}
          alt="Blinky"
          className="w-[100px] h-auto flex-shrink-0"
          style={{ marginRight: 4 }}
          initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 15, y: [0, -5, 0] }}
          transition={{
            opacity: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
            scale: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
            rotate: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
            y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
        />
      </motion.div>
      {/* Options list — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-2">
        <div className="flex flex-col gap-2">
          {GOALS.map((goal, i) => {
            const isSelected = selected === i;
            return (
              <motion.button
                key={i}
                data-testid={`option-goal-${i}`}
                onClick={() => setSelected(i)}
                className="w-full flex items-center gap-4 px-[22px] py-[18px] rounded-2xl bg-white text-left transition-colors"
                style={{
                  border: `2px solid ${isSelected ? "#282145" : "#e4e6fb"}`,
                }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.15 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-[28px] leading-none">{goal.emoji}</span>
                <span
                  className="text-[#2c2f30] text-[20px] font-bold leading-[28px]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {goal.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      {/* Footer — sticky Continue button */}
      <motion.div
        className="flex-shrink-0 px-4 pt-6 pb-2 bg-[#f6f7f8]"
        {...fadeUp(0.45)}
      >
        <button
          data-testid="button-continue"
          onClick={() => selected !== null && setLocation("/onboarding/fit")}
          disabled={selected === null}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center transition-all duration-300"
          style={{
            background: selected !== null ? "#282145" : "#d9d9d9",
            boxShadow: selected !== null ? "0px 4px 0px black" : "none",
            cursor: selected !== null ? "pointer" : "not-allowed",
          }}
        >
          <span
            className="text-[20px] font-bold tracking-[0.15px]"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: selected !== null ? "#f0f1fd" : "#5a5d73",
            }}
          >
            Continue
          </span>
        </button>
      </motion.div>
      <HomeIndicator />
    </MobileShell>
  );
};
