import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getCurrentSubject } from "@/lib/quizData";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const ACCENT = "#f0a030";
const BG = "#fff8e6";
const TEXT = "#3d2a00";

export const RebusIntro = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const topic = getCurrentSubject() ?? "General Knowledge";

  const handlePlay = () => {
    localStorage.setItem("rebusTopic", topic);
    setLocation("/rebus/play");
  };

  return (
    <MobileShell>
      <StatusBar />

      <motion.div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        {...fadeUp(0.04)}
      >
        <button
          onClick={() => setLocation("/home")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>🧩</span>
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

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          className="relative flex justify-center mb-[-24px] z-10"
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
        >
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            style={{ width: 120 }}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
        </motion.div>

        <motion.div
          className="w-full rounded-[32px] flex flex-col items-center gap-4 pt-[80px] pb-6 px-5"
          style={{ background: BG, border: `2px solid ${ACCENT}`, boxShadow: `0px 3px 0px ${ACCENT}` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.15 }}
        >
          <div className="rounded-full px-4 py-[3px]" style={{ background: ACCENT }}>
            <span
              className="text-white text-[12px] font-semibold uppercase tracking-[0.8px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              5 MIN REBUS
            </span>
          </div>

          <h2
            className="text-[26px] font-bold text-center leading-[32px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: TEXT }}
            data-testid="text-rebus-topic"
          >
            {topic} 🧩
          </h2>

          <div className="flex items-center justify-center gap-3 text-[36px]">
            <span>🔍</span><span>🤔</span><span>💡</span>
          </div>

          <p
            className="text-[15px] leading-[22px] text-center tracking-[0.3px] opacity-80"
            style={{ fontFamily: "'Inter', sans-serif", color: TEXT }}
          >
            Decode 6 emoji sequences to reveal hidden words about{" "}
            <strong>{topic}</strong>. Can you crack them all?
          </p>
        </motion.div>
      </div>

      <motion.div className="flex-shrink-0 px-4 pt-4 pb-2 flex flex-col items-center gap-3" {...fadeUp(0.32)}>
        <button
          data-testid="button-lets-play"
          onClick={handlePlay}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-white text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's play !
          </span>
        </button>

        <button
          data-testid="button-maybe-later"
          onClick={() => setLocation("/home")}
          className="pb-1"
        >
          <span className="text-[#9FA9BB] text-[15px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            Maybe later
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
