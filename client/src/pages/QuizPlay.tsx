import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Zap, Timer, Bookmark, Check } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getQuizById, getQuizForSubjects, getUserSubjects } from "@/lib/quizData";

type Phase = "selecting" | "revealed";

interface AnswerRecord {
  questionId: number;
  selectedLetter: string | null;
  correct: boolean;
  xp: number;
}

const QUESTION_TIME = 59;
const XP_CORRECT = 10;
const XP_INCORRECT = 5;

export const QuizPlay = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const params = useParams<{ quizId: string }>();
  const quizIdParam = params.quizId ?? "egyptian-gods";
  const quiz =
    getQuizById(quizIdParam) ??
    (quizIdParam === "generated" ? getQuizForSubjects(getUserSubjects()) : undefined);

  const [qIndex, setQIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("selecting");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = quiz?.questions[qIndex];
  const isCorrect =
    phase === "revealed" && selectedLetter === question?.correct;
  const isLast = qIndex === (quiz?.questions.length ?? 0) - 1;

  // Timer
  useEffect(() => {
    if (phase !== "selecting") return;
    if (timeLeft <= 0) {
      handleCheck(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.max(0, s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleCheck = (forced = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const sel = forced ? null : selectedLetter;
    const correct = sel === question?.correct;
    const xp = correct ? XP_CORRECT : XP_INCORRECT;
    setAnswers((prev) => [
      ...prev,
      { questionId: question?.id ?? qIndex, selectedLetter: sel, correct, xp },
    ]);
    setPhase("revealed");
  };

  const handleContinue = () => {
    if (isLast) {
      // answers already contains the last question (added by handleCheck)
      const correctCount = answers.filter((a) => a.correct).length;
      const totalXp = answers.reduce((sum, a) => sum + a.xp, 0);
      localStorage.setItem(
        "quizResults",
        JSON.stringify({
          quizId: quiz?.id,
          quizTitle: quiz?.title,
          quizEmoji: quiz?.emoji,
          correct: correctCount,
          total: quiz?.questions.length ?? 0,
          xp: totalXp,
          completedAt: new Date().toISOString(),
        })
      );
      setLocation(`/quiz/${quiz?.id ?? quizIdParam}/results`);
    } else {
      setQIndex((i) => i + 1);
      setSelectedLetter(null);
      setPhase("selecting");
      setTimeLeft(QUESTION_TIME);
    }
  };

  if (!quiz || !question) return <></>;

  const optionState = (letter: string): "idle" | "selected" | "correct" | "wrong-selected" | "correct-unselected" => {
    if (phase === "selecting") {
      return selectedLetter === letter ? "selected" : "idle";
    }
    if (letter === question.correct) return "correct";
    if (letter === selectedLetter) return "wrong-selected";
    return "idle";
  };

  const optionStyle = (state: ReturnType<typeof optionState>) => {
    switch (state) {
      case "selected":
        return {
          border: "2px solid #282145",
          background: "#fff",
        };
      case "correct":
        return {
          border: "2px solid #22c55e",
          background: "#fff",
        };
      case "wrong-selected":
        return {
          border: "2px solid #282145",
          background: "#fff",
        };
      default:
        return {
          border: "2px solid transparent",
          background: "#fff",
        };
    }
  };

  const badgeStyle = (state: ReturnType<typeof optionState>) => {
    switch (state) {
      case "selected":
        return { background: "#282145", color: "#fff" };
      case "correct":
        return { background: "#22c55e", color: "#fff" };
      case "wrong-selected":
        return { background: "#282145", color: "#fff" };
      default:
        return { background: "#e5e7eb", color: "#6b7280" };
    }
  };

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => setLocation(`/quiz/${params.quizId}`)}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <Zap size={22} color="#282145" strokeWidth={2} fill="#282145" />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Quick Quizz
          </span>
        </div>

        <button
          onClick={() => setLocation("/home")}
          data-testid="button-close"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <X size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress + Timer row */}
      <div className="flex items-center justify-between px-4 mt-1 flex-shrink-0">
        <div
          className="flex items-center justify-center rounded-full px-4 py-[6px] min-w-[68px]"
          style={{ background: "#282145" }}
          data-testid="badge-progress"
        >
          <span
            className="text-white text-[18px] font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {qIndex + 1}/{quiz.questions.length}
          </span>
        </div>

        <AnimatePresence>
          {phase === "selecting" && (
            <motion.div
              className="flex items-center gap-2 rounded-full px-4 py-[6px]"
              style={{ background: "#282145" }}
              data-testid="badge-timer"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Timer size={20} color="#f6f7f8" strokeWidth={2} />
              <span
                className="text-white text-[18px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {formatTime(timeLeft)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question card */}
      <motion.div
        key={`question-${qIndex}`}
        className="mx-4 mt-3 bg-white rounded-[20px] px-5 py-5 flex-shrink-0"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <p
          className="text-[#282145] text-[18px] font-bold uppercase leading-[26px] text-center"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-question"
        >
          {question.text}
        </p>
      </motion.div>

      {/* Options */}
      <div className="flex flex-col gap-3 mx-4 mt-3 flex-shrink-0">
        {question.options.map((opt) => {
          const state = optionState(opt.letter);
          const os = optionStyle(state);
          const bs = badgeStyle(state);
          const showCheck = state === "correct";

          return (
            <motion.button
              key={opt.letter}
              data-testid={`option-${opt.letter}`}
              className="relative flex items-center gap-4 rounded-[16px] px-4 py-[14px] w-full text-left transition-transform active:scale-[0.98]"
              style={{ ...os, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onClick={() => {
                if (phase === "selecting") setSelectedLetter(opt.letter);
              }}
              layout
            >
              {/* Letter badge */}
              <div
                className="flex items-center justify-center rounded-[10px] flex-shrink-0 transition-colors"
                style={{ width: 40, height: 40, ...bs }}
              >
                <span
                  className="text-[16px] font-bold"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {opt.letter}
                </span>
              </div>

              <span
                className="text-[#282145] text-[16px] font-medium flex-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {opt.text}
              </span>

              {/* Checkmark badge for correct */}
              {showCheck && (
                <div
                  className="absolute top-[-8px] right-[-8px] flex items-center justify-center rounded-full bg-[#22c55e]"
                  style={{ width: 26, height: 26 }}
                >
                  <Check size={14} color="white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Check button */}
      {phase === "selecting" && (
        <div className="flex justify-center mb-3 flex-shrink-0 px-4">
          <button
            data-testid="button-check"
            disabled={selectedLetter === null}
            onClick={() => handleCheck()}
            className="w-full h-[56px] rounded-[30px] flex items-center justify-center transition-opacity disabled:opacity-50"
            style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
          >
            <span
              className="text-white text-[20px] font-bold"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Check
            </span>
          </button>
        </div>
      )}

      {/* Feedback panel */}
      <AnimatePresence>
        {phase === "revealed" && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-[32px] px-4 pt-5 pb-3"
            style={{
              background: isCorrect ? "#dcfce7" : "#f3f4f6",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            data-testid="panel-feedback"
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[26px]">{isCorrect ? "🐪" : "🤔"}</span>
              <span
                className="text-[22px] font-bold text-[#282145] flex-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-feedback-result"
              >
                {isCorrect ? "Correct!" : "Incorrect!"}
              </span>
              <span
                className="text-[16px] font-bold"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "#22c55e",
                }}
              >
                ✦ +{isCorrect ? XP_CORRECT : XP_INCORRECT} XP
              </span>
              <button
                data-testid="button-bookmark"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/60"
              >
                <Bookmark size={18} color="#282145" strokeWidth={2} />
              </button>
            </div>

            {/* Incorrect correction text */}
            {!isCorrect && question.correctExplanation && (
              <p
                className="text-[#282145] text-[16px] font-bold mb-2 leading-[22px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {question.correctExplanation}
              </p>
            )}

            {/* Fun fact card */}
            <div className="bg-white rounded-[16px] px-4 py-3 mb-4 flex items-start gap-2">
              <span className="text-[18px] flex-shrink-0">{question.funFactEmoji}</span>
              <p
                className="text-[#282145] text-[14px] leading-[20px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {question.funFact}
              </p>
            </div>

            {/* Action buttons */}
            {isCorrect ? (
              <div className="flex gap-3">
                <button
                  data-testid="button-why"
                  className="flex-1 h-[50px] rounded-[30px] bg-white/70 flex items-center justify-center border border-white"
                >
                  <span
                    className="text-[#282145] text-[16px] font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Why ?
                  </span>
                </button>
                <button
                  data-testid="button-continue"
                  onClick={handleContinue}
                  className="flex-[2] h-[50px] rounded-[30px] flex items-center justify-center"
                  style={{ background: "#22c55e", boxShadow: "0px 3px 0px #16a34a" }}
                >
                  <span
                    className="text-white text-[16px] font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Continue
                  </span>
                </button>
              </div>
            ) : (
              <button
                data-testid="button-continue"
                onClick={handleContinue}
                className="w-full h-[56px] rounded-[30px] flex items-center justify-center"
                style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
              >
                <span
                  className="text-white text-[20px] font-bold"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Continue
                </span>
              </button>
            )}

            <HomeIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "selecting" && <HomeIndicator />}
    </MobileShell>
  );
};
