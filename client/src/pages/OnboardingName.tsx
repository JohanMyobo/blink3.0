import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { saveUserName, getUserName } from "@/lib/quizData";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const OnboardingName = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [name, setName] = useState(() => getUserName());

  const canContinue = name.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    saveUserName(name);
    setLocation("/onboarding/goal");
  };

  return (
    <MobileShell>
      <StatusBar />

      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/intro")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center w-full">

          <motion.div
            className="flex flex-col items-center mb-[-8px]"
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          >
            <div
              className="bg-[#f0f1fd] border-2 border-[#8174e0] rounded-xl px-5 py-4 w-[238px] flex items-center justify-center"
              style={{ boxShadow: "0px 3px 0px #8174e0" }}
            >
              <p
                className="text-[#282145] text-[16px] font-semibold text-center tracking-[0.5px] leading-[24px]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                What's your first name?
              </p>
            </div>
            <div className="relative w-[238px] flex justify-center">
              <div className="w-0 h-0" style={{ borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "16px solid #8174e0" }} />
            </div>
          </motion.div>

          <motion.div
            style={{ marginTop: 16 }}
            initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 15 }}
            transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.22 }}
          >
            <motion.img
              src={blinkySvg}
              alt="Blinky"
              data-testid="img-blinky"
              className="w-[172px] h-auto"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </motion.div>

          <motion.div className="w-full mt-8" {...fadeUp(0.3)}>
            <input
              data-testid="input-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder="Your first name"
              maxLength={32}
              autoFocus
              className="w-full h-[60px] rounded-[20px] px-5 text-[20px] font-bold text-[#282145] placeholder:text-[#c4c8e2] outline-none"
              style={{
                background: "white",
                border: "2px solid #8174e0",
                boxShadow: "0px 3px 0px #8174e0",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            />
          </motion.div>

        </div>
      </div>

      <motion.div className="px-4 pb-2 flex-shrink-0" style={{ marginBottom: 8 }} {...fadeUp(0.42)}>
        <button
          data-testid="button-continue"
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center transition-all duration-300"
          style={{
            background: canContinue ? "#282145" : "#d9d9d9",
            boxShadow: canContinue ? "0px 4px 0px black" : "none",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          <span
            className="text-[20px] font-bold tracking-[0.15px]"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: canContinue ? "#f0f1fd" : "#5a5d73",
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
