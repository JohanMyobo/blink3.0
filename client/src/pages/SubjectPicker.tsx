import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { saveUserSubjects, generateQuizFromSubjects, resetSubjectRotation } from "@/lib/quizData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const SubjectPicker = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [subjects, setSubjects] = useState<string[]>([""]);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastInputRef = useRef<HTMLInputElement>(null);

  const hasAny = subjects.some(s => s.trim().length > 0);

  const updateSubject = (i: number, value: string) => {
    setSubjects(prev => prev.map((s, idx) => (idx === i ? value : s)));
  };

  const addSubject = () => {
    setSubjects(prev => [...prev, ""]);
    setTimeout(() => lastInputRef.current?.focus(), 80);
  };

  const handleContinue = async () => {
    if (!hasAny || isGenerating) return;
    const filtered = subjects.filter(s => s.trim().length > 0);
    saveUserSubjects(filtered);
    resetSubjectRotation();
    setIsGenerating(true);
    generateQuizFromSubjects([filtered[0]]).finally(() => {
      setIsGenerating(false);
      setLocation("/onboarding/complete");
    });
  };

  return (
    <MobileShell>
      <StatusBar />
      <motion.div className="px-4 mt-2 flex-shrink-0" {...fadeUp(0.05)}>
        <button
          onClick={() => setLocation("/onboarding/vibe")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </motion.div>
      <motion.div className="px-[34px] mt-6 flex-shrink-0 flex flex-col gap-2 pl-[16px] pr-[16px]" {...fadeUp(0.1)}>
        <h1
          className="text-[#282145] text-[28px] font-bold leading-[36px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-title"
        >
          What's your favorites subjects?
        </h1>
        <p
          className="text-[#595c5d] text-[16px] font-normal leading-[24px] tracking-[0.5px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          We will tailor your experience to this theme. You can write everything we will make it work!
        </p>
      </motion.div>
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-2">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {subjects.map((subject, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <input
                  ref={i === subjects.length - 1 ? lastInputRef : undefined}
                  type="text"
                  value={subject}
                  onChange={e => updateSubject(i, e.target.value)}
                  placeholder="Your subject"
                  data-testid={`input-subject-${i}`}
                  className="w-full h-[56px] bg-white rounded-xl px-4 text-[20px] font-bold text-[#1e2326] placeholder:font-normal placeholder:text-[#595c5d] outline-none"
                  style={{
                    border: "2px solid #e9e9f0",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#8174e0")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e9e9f0")}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            onClick={addSubject}
            data-testid="button-add-subject"
            className="w-full flex items-center justify-center py-[17px] rounded-[32px] bg-[#f6f7f8] border border-[rgba(171,173,174,0.1)]"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="w-8 h-8 rounded-full bg-[#bfc6d1] flex items-center justify-center">
              <Plus size={20} color="white" strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>
      </div>
      <motion.div className="flex-shrink-0 px-4 pt-6 pb-2 bg-[#f6f7f8]" {...fadeUp(0.38)}>
        <button
          data-testid="button-continue"
          onClick={handleContinue}
          disabled={!hasAny || isGenerating}
          className="w-full h-[64px] rounded-[30px] flex items-center justify-center transition-all duration-300"
          style={{
            background: hasAny ? "#282145" : "#d9d9d9",
            boxShadow: hasAny ? "0px 4px 0px black" : "none",
            cursor: hasAny && !isGenerating ? "pointer" : "not-allowed",
          }}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <span
                className="text-[20px] font-bold tracking-[0.15px] text-[#f0f1fd]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Creating your quiz…
              </span>
            </div>
          ) : (
            <span
              className="text-[20px] font-bold tracking-[0.15px]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                color: hasAny ? "#f0f1fd" : "#5a5d73",
              }}
            >
              Continue
            </span>
          )}
        </button>
      </motion.div>
      <HomeIndicator />
    </MobileShell>
  );
};
