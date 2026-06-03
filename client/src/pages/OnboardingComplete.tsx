import { useState } from "react";
import { useLocation } from "wouter";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { useQueryClient } from "@tanstack/react-query";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const OnboardingComplete = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const handleLetsGo = async () => {
    setIsPending(true);
    try {
      await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        credentials: "include",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch {
      // fail-open: navigate regardless
    } finally {
      setLocation("/start");
    }
  };

  return (
    <MobileShell>
      <StatusBar />

      {/* Back button */}
      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/subjects")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>

      {/* Illustration area — centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center">

          {/* Speech bubble with downward spike */}
          <motion.div
            className="flex flex-col items-center mb-2"
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.3 }}
          >
            {/* Bubble box */}
            <div
              className="bg-[#f0f1fd] px-4 py-4 rounded-xl flex items-center justify-center"
              style={{
                width: 238,
                border: "2px solid #8174e0",
                borderBottom: "2px solid #8174e0",
                boxShadow: "0px 3px 0px #8174e0",
              }}
            >
              <p
                className="text-[#282145] text-[16px] font-semibold text-center tracking-[0.5px] leading-[24px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
                data-testid="text-speech"
              >
                Perfect! Let's start winning!
              </p>
            </div>

            {/* Downward spike */}
            <div className="relative flex justify-center" style={{ height: 18 }}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "14px solid #8174e0",
                }}
              />
              <div
                style={{
                  display: "none",
                  position: "absolute",
                  top: 0,
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "12px solid #f0f1fd",
                }}
              />
            </div>
          </motion.div>

          {/* Blinky */}
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            style={{ width: 130 }}
            initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 15, y: [0, -8, 0] }}
            transition={{
              opacity: { type: "spring", stiffness: 240, damping: 18, delay: 0.15 },
              scale: { type: "spring", stiffness: 240, damping: 18, delay: 0.15 },
              rotate: { type: "spring", stiffness: 240, damping: 18, delay: 0.15 },
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="flex-shrink-0 px-4 pt-6 pb-2 bg-[#f6f7f8]"
        {...fadeUp(0.5)}
      >
        <button
          data-testid="button-lets-go"
          onClick={handleLetsGo}
          disabled={isPending}
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center disabled:opacity-70"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          {isPending ? (
            <Loader2 size={24} className="text-[#f0f1fd] animate-spin" />
          ) : (
            <span
              className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Let's go!
            </span>
          )}
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
