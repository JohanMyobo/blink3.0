import { useLocation } from "wouter";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

const spring = (delay = 0, stiffness = 260, damping = 22) => ({
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", stiffness, damping, delay },
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 260, damping: 24, delay },
});

export const YoullFitRightIn = (): JSX.Element => {
  const [, setLocation] = useLocation();

  return (
    <MobileShell>
      <StatusBar />

      {/* Back button */}
      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/goal")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>

      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Blinky + overlays + shadow */}
        <div className="relative" style={{ width: 220, height: 230 }}>

          {/* Shadow ellipse */}
          <motion.img
            src="/figmaAssets/blinky-shadow.svg"
            alt=""
            className="absolute"
            style={{ width: 89, height: 27, left: 65, bottom: 8 }}
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.5 }}
          />

          {/* Blinky character */}
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            className="absolute"
            style={{ width: 114, left: 53, top: 60 }}
            initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 15, y: [0, -7, 0] }}
            transition={{
              opacity: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
              scale: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
              rotate: { type: "spring", stiffness: 240, damping: 18, delay: 0.2 },
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
            }}
          />

          {/* Overlay 1 — top center */}
          <motion.img
            src="/figmaAssets/overlay-1.svg"
            alt=""
            className="absolute"
            style={{ width: 48, height: 48, left: 88, top: 2 }}
            {...spring(0.35)}
            animate={{
              ...spring(0.35).animate,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { type: "spring", stiffness: 260, damping: 22, delay: 0.35 },
              scale: { type: "spring", stiffness: 260, damping: 22, delay: 0.35 },
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            }}
          />

          {/* Overlay 2 — top right */}
          <motion.img
            src="/figmaAssets/overlay-2.svg"
            alt=""
            className="absolute"
            style={{ width: 48, height: 48, left: 152, top: 16 }}
            {...spring(0.45)}
            animate={{
              ...spring(0.45).animate,
              y: [0, -5, 0],
            }}
            transition={{
              opacity: { type: "spring", stiffness: 260, damping: 22, delay: 0.45 },
              scale: { type: "spring", stiffness: 260, damping: 22, delay: 0.45 },
              y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            }}
          />

          {/* Overlay 3 — top left */}
          <motion.img
            src="/figmaAssets/overlay-3.svg"
            alt=""
            className="absolute"
            style={{ width: 48, height: 48, left: 10, top: 14 }}
            {...spring(0.4)}
            animate={{
              ...spring(0.4).animate,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { type: "spring", stiffness: 260, damping: 22, delay: 0.4 },
              scale: { type: "spring", stiffness: 260, damping: 22, delay: 0.4 },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
            }}
          />
        </div>

        {/* Copy */}
        <motion.div
          className="flex flex-col items-center gap-2 text-center mt-10 px-8"
          style={{ maxWidth: 325 }}
          {...fadeUp(0.55)}
        >
          <h2
            className="text-[#282145] text-[28px] font-bold leading-[36px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            data-testid="text-heading"
          >
            You'll fit right in
          </h2>
          <p
            className="text-[#595c5d] text-[16px] font-normal leading-[24px] tracking-[0.5px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
            data-testid="text-body"
          >
            Millions are already making better use of their time.{" "}
            Now it's your turn.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div className="flex-shrink-0 px-4 pt-6 pb-2 bg-[#f6f7f8]" {...fadeUp(0.65)}>
        <button
          data-testid="button-continue"
          onClick={() => setLocation("/onboarding/vibe")}
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Continue
          </span>
        </button>
      </motion.div>

      <HomeIndicator />
    </MobileShell>
  );
};
