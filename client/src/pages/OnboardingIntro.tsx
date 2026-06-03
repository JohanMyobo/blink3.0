import { useState, useEffect } from "react";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

const MESSAGES = [
  "Hi, I'm Blinky.",
  "Turn your small moments into something useful, fun, or meaningful.",
];

const CYCLE_DELAY = 3000;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const SpeechBubble = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center w-full">
    <div
      className="bg-[#f0f1fd] border-2 border-[#8174e0] rounded-xl px-5 py-4 w-[238px] flex items-center justify-center"
      style={{ boxShadow: "0px 3px 0px #8174e0" }}
    >
      <p
        className="text-[#282145] text-[16px] font-semibold text-center tracking-[0.5px] leading-[24px]"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {text}
      </p>
    </div>
    <div className="relative w-[238px] flex justify-center">
      <div className="w-0 h-0" style={{ borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "16px solid #8174e0" }} />
    </div>
  </div>
);

export const OnboardingIntro = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, CYCLE_DELAY);
    return () => clearInterval(timer);
  }, []);

  return (
    <MobileShell>
      <StatusBar />

      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">

          {/* Fixed-height container so neither message affects layout */}
          <div className="relative w-[238px]" style={{ height: 148, marginBottom: -8 }}>
            <AnimatePresence>
              {MESSAGES.map((msg, i) =>
                i === msgIndex ? (
                  <motion.div
                    key={i}
                    className="absolute inset-0 flex items-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <SpeechBubble text={msg} />
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>

          <motion.img
            src={blinkySvg}
            alt="Blinky"
            data-testid="img-blinky"
            className="w-[172px] h-auto"
            style={{ marginTop: 8 }}
            initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 15, y: [0, -7, 0] }}
            transition={{
              opacity: { type: "spring", stiffness: 240, damping: 18, delay: 0.28 },
              scale: { type: "spring", stiffness: 240, damping: 18, delay: 0.28 },
              rotate: { type: "spring", stiffness: 240, damping: 18, delay: 0.28 },
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
          />
        </div>
      </div>

      <motion.div className="px-4 pb-2 flex-shrink-0" style={{ marginBottom: 8 }} {...fadeUp(0.38)}>
        <button
          onClick={() => setLocation("/onboarding/name")}
          data-testid="button-lets-go"
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center active:scale-[0.97] transition-transform"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's go !
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
