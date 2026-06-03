import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Zap, RefreshCw } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getQuizById, getGeneratedQuiz, clearGeneratedQuiz, generateQuizFromSubjects, getQuizForSubjects, getCurrentSubject, advanceToNextSubject, type Quiz } from "@/lib/quizData";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import quizBlinkySvg from "@assets/QuizBlinky_1779367272736.svg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const QuizIntro = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const params = useParams<{ quizId: string }>();
  const quizId = params.quizId ?? "egyptian-gods";

  const [quiz, setQuiz] = useState<Quiz | null>(() => getQuizById(quizId) ?? null);
  const [isLoading, setIsLoading] = useState(quizId === "generated" && !getGeneratedQuiz());
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    if (isShuffling) return;
    advanceToNextSubject();
    const nextSubject = getCurrentSubject();
    if (!nextSubject) return;
    setIsShuffling(true);
    generateQuizFromSubjects([nextSubject]).then((generated) => {
      if (generated) setQuiz(generated);
      setIsShuffling(false);
    });
  };

  useEffect(() => {
    if (quizId !== "generated") return;
    const cached = getGeneratedQuiz();
    if (cached) { setQuiz(cached); setIsLoading(false); return; }

    const currentSubject = getCurrentSubject();
    if (!currentSubject) {
      setLocation("/home");
      return;
    }
    setIsLoading(true);
    generateQuizFromSubjects([currentSubject]).then((generated) => {
      if (generated) {
        setQuiz(generated);
        setIsLoading(false);
      } else {
        // generation failed — go back home rather than showing a premade quiz
        setLocation("/home");
      }
    });
  }, [quizId]);

  if (isLoading) {
    return (
      <MobileShell>
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            style={{ width: 100 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-10 h-10 border-[3px] rounded-full"
              style={{ borderColor: "#e0ddf8", borderTopColor: "#8174e0" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <p
              className="text-[#282145] text-[18px] font-bold text-center"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Creating your quiz…
            </p>
            <p
              className="text-[#9FA9BB] text-[14px] text-center leading-[20px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Blinky is crafting 10 questions just for you!
            </p>
          </div>
        </div>
        <HomeIndicator />
      </MobileShell>
    );
  }

  if (!quiz) {
    setLocation("/home");
    return <></>;
  }

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
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          className="relative flex justify-center mb-[-24px] z-10"
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.1 }}
        >
          <motion.img
            src={quizBlinkySvg}
            alt="Blinky"
            style={{ width: 130 }}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />

        </motion.div>

        <motion.div
          className="w-full rounded-[32px] bg-[#f0f1fd] flex flex-col items-center gap-3 pt-[80px] pb-6 px-5 relative overflow-hidden"
          style={{ border: "2px solid #8174e0", boxShadow: "0px 3px 0px #8174e0", opacity: isShuffling ? 0.55 : 1 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: isShuffling ? 0.55 : 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: isShuffling ? 0 : 0.15 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={quiz.title}
              className="flex flex-col items-center gap-3 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <div className="bg-[#8174e0] rounded-full px-4 py-[3px]">
                <span
                  className="text-white text-[12px] font-semibold uppercase tracking-[0.8px]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {quiz.badge}
                </span>
              </div>

              <h2
                className="text-[#282145] text-[28px] font-bold text-center leading-[34px]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-quiz-title"
              >
                {quiz.title} {quiz.emoji}
              </h2>

              <p
                className="text-[#595c5d] text-[15px] leading-[22px] text-center tracking-[0.3px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {quiz.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {isShuffling && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-[32px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-9 h-9 border-[3px] rounded-full"
                style={{ borderColor: "#e0ddf8", borderTopColor: "#8174e0" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div className="flex-shrink-0 px-4 pt-4 pb-2 flex flex-col items-center gap-3" {...fadeUp(0.32)}>
        <button
          data-testid="button-lets-go"
          onClick={() => setLocation(`/quiz/${quiz.id}/play`)}
          className="w-full h-[64px] rounded-[30px] bg-[#282145] flex items-center justify-center"
          style={{ boxShadow: "0px 4px 0px black" }}
        >
          <span
            className="text-[#f0f1fd] text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Let's go !
          </span>
        </button>

        {quizId === "generated" && (
          <motion.button
            data-testid="button-shuffle-quiz"
            onClick={handleShuffle}
            disabled={isShuffling}
            className="w-full h-[56px] rounded-[28px] flex items-center justify-center gap-2"
            style={{
              background: "#f0f1fd",
              border: "2px solid #8174e0",
              boxShadow: "0px 3px 0px #8174e0",
              opacity: isShuffling ? 0.6 : 1,
            }}
            whileTap={isShuffling ? {} : { scale: 0.97 }}
          >
            <motion.div
              animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
              transition={isShuffling ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw size={18} color="#8174e0" strokeWidth={2.5} />
            </motion.div>
            <span
              className="text-[17px] font-bold text-[#8174e0]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {isShuffling ? "Generating…" : "New questions"}
            </span>
          </motion.button>
        )}

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
