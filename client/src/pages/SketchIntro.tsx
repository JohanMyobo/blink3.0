import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X, Paintbrush } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getStoredPrompt, pickAndStorePrompt } from "@/lib/prompts";
import blinkySvg from "@assets/Group_213_1779363665605.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const SketchIntro = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const prompt = getStoredPrompt() ?? pickAndStorePrompt();

  return (
    <MobileShell>
      <StatusBar />

      <motion.div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        {...fadeUp(0.05)}
      >
        <button
          onClick={() => setLocation("/home")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <Paintbrush size={22} color="#5fa6fc" strokeWidth={2} fill="#5fa6fc" />
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
            style={{ width: 260 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />


        </motion.div>

        <motion.div
          className="w-full rounded-[32px] bg-[#f0f1fd] flex flex-col items-center gap-3 pt-[80px] pb-6 px-5"
          style={{ border: "2px solid #5fa6fc", boxShadow: "0px 3px 0px #5fa6fc" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.15 }}
        >
          <div className="rounded-full px-4 py-[3px]" style={{ background: "#5fa6fc" }}>
            <span
              className="text-white text-[12px] font-semibold uppercase tracking-[0.8px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              3 MIN Drawing
            </span>
          </div>

          <h2
            className="text-[28px] font-bold text-center leading-[34px] uppercase"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#022c5f" }}
            data-testid="text-sketch-prompt"
          >
            Draw {prompt.word}
          </h2>

          <p
            className="text-[#595c5d] text-[15px] leading-[22px] text-center tracking-[0.3px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Clear your mind, grab your stylus, and get ready to create!
          </p>
        </motion.div>
      </div>

      <motion.div className="flex-shrink-0 px-4 pt-4 pb-2 flex flex-col items-center gap-3" {...fadeUp(0.32)}>
        <button
          data-testid="button-lets-go"
          onClick={() => setLocation("/game/sketch")}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's go !
          </span>
        </button>

        <button
          data-testid="button-not-yet"
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
