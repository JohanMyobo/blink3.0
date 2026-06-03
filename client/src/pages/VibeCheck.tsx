import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

const OPTIONS = [
  { emoji: "😵‍💫", label: "15min - 30min" },
  { emoji: "🧠", label: "30min - 1hr" },
  { emoji: "😌", label: "1hr - 2hr" },
  { emoji: "⚡", label: "More than 2hr" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const VibeCheck = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <MobileShell>
      <StatusBar />
      {/* Back button */}
      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/fit")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>
      {/* Heading */}
      <motion.div className="px-[34px] mt-6 flex-shrink-0 flex flex-col gap-2 pl-[16px] pr-[16px]" {...fadeUp(0.1)}>
        <h1
          className="text-[#282145] text-[28px] font-bold leading-[36px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-title"
        >
          The Vibe Check
        </h1>
        <p
          className="text-[#595c5d] text-[16px] font-normal leading-[24px] tracking-[0.5px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Let's be real, how much time are we losing to the void?
        </p>
      </motion.div>
      {/* Options */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-2">
        <div className="flex gap-2 flex-col">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <motion.button
                key={i}
                data-testid={`option-time-${i}`}
                onClick={() => setSelected(i)}
                className="w-full flex items-center gap-4 px-[22px] py-[18px] rounded-2xl bg-white text-left transition-colors"
                style={{ border: `2px solid ${isSelected ? "#282145" : "#e4e6fb"}` }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.15 + i * 0.07 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-[28px] leading-none">{opt.emoji}</span>
                <span
                  className="text-[#2c2f30] text-[20px] font-bold leading-[28px]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      {/* Footer */}
      <motion.div className="flex-shrink-0 px-4 pt-6 pb-2 bg-[#f6f7f8]" {...fadeUp(0.42)}>
        <button
          data-testid="button-continue"
          onClick={() => selected !== null && setLocation("/onboarding/subjects")}
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
