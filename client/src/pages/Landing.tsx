import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const Landing = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const firstName = user?.firstName?.trim() || "there";
  const xp = user?.xp ?? 0;

  return (
    <MobileShell>
      <StatusBar />

      {/* Top bar: greeting + XP pill */}
      <motion.div
        className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0"
        {...fadeUp(0.05)}
      >
        <h1
          className="text-[24px] font-bold text-[#2c2f30] leading-[30px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-greeting"
        >
          Hello {firstName}
        </h1>

        <div
          className="flex items-center gap-1 px-3 py-[6px] rounded-full"
          style={{ background: "#55429e" }}
          data-testid="pill-xp"
        >
          <span
            className="text-white text-[16px] font-bold leading-none"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            data-testid="text-xp"
          >
            {xp}
          </span>
          <Zap size={14} color="white" strokeWidth={2.5} fill="white" />
        </div>
      </motion.div>

      {/* Speech bubble + Blinky */}
      <motion.div
        className="flex flex-col items-center px-4 mt-4 flex-shrink-0"
        {...fadeUp(0.12)}
      >
        <div
          className="px-4 py-3 rounded-xl flex items-center justify-center"
          style={{
            background: "#f0f1fd",
            border: "2px solid #8174e0",
            boxShadow: "0px 3px 0px #8174e0",
            maxWidth: 238,
          }}
        >
          <p
            className="text-[#282145] text-[15px] font-semibold text-center tracking-[0.3px] leading-[22px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
            data-testid="text-blinky-speech"
          >
            Ready to transform your doomscrolling time into meaningful moments!
          </p>
        </div>

        <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid #8174e0" }} />

        <motion.img
          src={blinkySvg}
          alt="Blinky"
          style={{ width: 100, marginTop: 6 }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          data-testid="img-blinky"
        />
      </motion.div>

      {/* Headline (jumbo-mini) */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6"
        {...fadeUp(0.22)}
      >
        <span
          className="text-[#9590e9] text-[15px] font-bold tracking-[0.5px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
          data-testid="text-ready-eyebrow"
        >
          Ready to start?
        </span>

        <h2
          className="text-[28px] font-bold text-center leading-[36px] mt-2"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#2c2f30" }}
          data-testid="text-quick-winner"
        >
          Hello, <span style={{ color: "#55429e" }}>Quick</span> Winner!
        </h2>

        <p
          className="text-[#595c5d] text-[15px] leading-[22px] text-center tracking-[0.3px] mt-3 max-w-[260px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Turn your spare minutes into small wins.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div className="flex-shrink-0 px-4 pb-3" {...fadeUp(0.34)}>
        <button
          data-testid="button-lets-go"
          onClick={() => setLocation("/home")}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-white text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's go !
          </span>
        </button>
      </motion.div>

      <BottomNav />
      <HomeIndicator />
    </MobileShell>
  );
};
