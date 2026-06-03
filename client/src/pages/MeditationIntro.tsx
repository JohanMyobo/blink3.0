import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X, Wind, Flame, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import blinkyMeditation from "@assets/Group_217_1779443364102.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

const ACCENT = "#5ecba1";
const BG = "#edfaf5";
const DARK = "#1a3d35";

const DURATIONS = [
  { minutes: 1, label: "1 min" },
  { minutes: 3, label: "3 min" },
  { minutes: 5, label: "5 min" },
];

type MeditationSummary = {
  streak: number;
  completedToday: boolean;
  last7: { date: string; completed: boolean }[];
  totalSessions: number;
};

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export const MeditationIntro = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(3);

  const { data: summary } = useQuery<MeditationSummary>({
    queryKey: ["/api/meditation/recent"],
    staleTime: 60_000,
  });

  const handleStart = () => {
    localStorage.setItem("meditationDuration", String(selectedMinutes));
    setLocation("/meditation/session");
  };

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
          <Wind size={22} color={ACCENT} strokeWidth={2.5} />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Breathe
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
            src={blinkyMeditation}
            alt="Blinky"
            style={{ width: 220 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </motion.div>

        <motion.div
          className="w-full rounded-[32px] flex flex-col items-center gap-4 pt-[60px] pb-6 px-5"
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
              Mindful Break
            </span>
          </div>

          <h2
            className="text-[26px] font-bold text-center leading-[32px] uppercase"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: DARK }}
            data-testid="text-meditation-title"
          >
            Take a deep breath
          </h2>

          <p
            className="text-[#595c5d] text-[14px] leading-[20px] text-center tracking-[0.3px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Pick a length and follow Blinky's lead. Breathe in, hold, breathe out.
          </p>

          {summary && (
            <div className="w-full flex flex-col items-center gap-2 mt-1" data-testid="meditation-history">
              <div className="flex items-center gap-2">
                <Flame size={14} color="#f97316" strokeWidth={2.5} />
                <span
                  className="text-[13px] font-bold uppercase tracking-[0.6px]"
                  style={{ fontFamily: "'Inter', sans-serif", color: DARK }}
                  data-testid="text-intro-streak"
                >
                  {summary.streak > 0
                    ? `${summary.streak} day${summary.streak === 1 ? "" : "s"} streak`
                    : "Start a new streak"}
                </span>
              </div>
              <div className="flex items-center gap-[6px]" data-testid="last-7-days-strip">
                {summary.last7.map((day, idx) => {
                  const dt = new Date(day.date + "T00:00:00");
                  const dow = dt.getDay();
                  const isToday = idx === summary.last7.length - 1;
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center gap-1"
                      data-testid={`day-${day.date}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: day.completed ? ACCENT : "white",
                          border: `1.5px solid ${day.completed ? ACCENT : isToday ? DARK : "#d4ece2"}`,
                        }}
                      >
                        {day.completed ? (
                          <Check size={14} color="white" strokeWidth={3} />
                        ) : (
                          <span
                            className="text-[11px] font-bold"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: isToday ? DARK : "#a8c7b9",
                            }}
                          >
                            {DAY_LETTERS[dow]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2" data-testid="duration-picker">
            {DURATIONS.map(({ minutes, label }) => {
              const isSelected = selectedMinutes === minutes;
              return (
                <motion.button
                  key={minutes}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedMinutes(minutes)}
                  data-testid={`button-duration-${minutes}`}
                  className="px-5 py-2 rounded-[16px] transition-colors"
                  style={{
                    background: isSelected ? ACCENT : "white",
                    border: `2px solid ${isSelected ? ACCENT : "#d4ece2"}`,
                    boxShadow: isSelected ? `0px 2px 0px ${DARK}` : "none",
                  }}
                >
                  <span
                    className="text-[15px] font-bold"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      color: isSelected ? "white" : DARK,
                    }}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div className="flex-shrink-0 px-4 pt-4 pb-2 flex flex-col items-center gap-3" {...fadeUp(0.32)}>
        <button
          data-testid="button-start-meditation"
          onClick={handleStart}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center"
          style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's breathe
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
