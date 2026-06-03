import { useEffect, useState } from "react";
import blinkySvg from "@assets/Blinky_1779363256568.svg";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Paintbrush, Sparkles, Lock, Zap, Wind } from "lucide-react";

import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { BottomNav } from "@/components/BottomNav";
import { pickAndStorePrompt, type Prompt } from "@/lib/prompts";
import {
  getQuizForSubjects,
  getGeneratedQuiz,
  generateQuizFromSubjects,
  getCurrentSubject,
  type Quiz,
} from "@/lib/quizData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

interface GameCardProps {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  textColor: string;
  locked?: boolean;
  onClick?: () => void;
  testId: string;
  delay?: number;
}

const GameCard = ({
  title,
  badge,
  description,
  icon,
  accentColor,
  bgColor,
  textColor,
  locked,
  onClick,
  testId,
  delay = 0,
}: GameCardProps) => (
  <motion.div className="relative" {...fadeUp(delay)}>
    <div
      className={`rounded-[28px] flex flex-col gap-3 px-5 py-5 ${locked ? "opacity-60" : "cursor-pointer active:scale-[0.98]"} transition-transform`}
      style={{
        background: bgColor,
        border: `2px solid ${accentColor}`,
        boxShadow: `0px 3px 0px ${accentColor}`,
      }}
      data-testid={testId}
      onClick={locked ? undefined : onClick}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-full px-3 py-[3px]" style={{ background: accentColor }}>
          <span
            className="text-white text-[11px] font-semibold uppercase tracking-[0.5px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {badge}
          </span>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/60">
          {locked ? <Lock size={18} color={accentColor} strokeWidth={2.5} /> : icon}
        </div>
      </div>

      <div>
        <h3
          className="text-[22px] font-bold uppercase leading-[28px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: textColor }}
          data-testid={`${testId}-title`}
        >
          {title}
        </h3>
        <p
          className="text-[14px] leading-[20px] mt-1 opacity-75"
          style={{ fontFamily: "'Inter', sans-serif", color: textColor }}
        >
          {description}
        </p>
      </div>

      {locked && (
        <div
          className="text-[12px] font-semibold text-center py-2 rounded-full"
          style={{ background: accentColor + "22", color: accentColor, fontFamily: "'Inter', sans-serif" }}
        >
          Coming soon
        </div>
      )}
    </div>
  </motion.div>
);

export const GameHome = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [displayQuiz, setDisplayQuiz] = useState<Quiz | null>(null);
  const [quizRoute, setQuizRoute] = useState("/quiz/egyptian-gods");

  useEffect(() => {
    const picked = pickAndStorePrompt();
    setPrompt(picked);

    const currentSubject = getCurrentSubject();

    const cached = getGeneratedQuiz();
    if (cached) {
      setDisplayQuiz(cached);
      setQuizRoute("/quiz/generated");
      return;
    }

    if (currentSubject) {
      setDisplayQuiz({
        id: "generated",
        title: currentSubject,
        emoji: "✨",
        badge: "5 MIN QUIZZ",
        description: "Personalised quiz being prepared just for you",
        keywords: [],
        questions: [],
      });
      setQuizRoute("/quiz/generated");

      generateQuizFromSubjects([currentSubject]).then((generated) => {
        if (generated) {
          setDisplayQuiz(generated);
        }
        // if generation fails, keep the placeholder — never show premade when subjects exist
      });
    } else {
      const fallback = getQuizForSubjects([]);
      setDisplayQuiz(fallback);
      setQuizRoute(`/quiz/${fallback.id}`);
    }
  }, []);

  return (
    <MobileShell>
      <StatusBar />

      <motion.div
        className="flex flex-col items-center pt-3 pb-4 flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
      >
        <div className="flex flex-col items-center mb-1">
          <div
            className="bg-[#f0f1fd] px-5 py-3 rounded-2xl flex items-center justify-center"
            style={{ border: "2px solid #8174e0", boxShadow: "0px 3px 0px #8174e0" }}
          >
            <p
              className="text-[#282145] text-[15px] font-semibold text-center tracking-[0.3px] leading-[22px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
              data-testid="text-blinky-greeting"
            >
              Hey! Ready to sketch today? 🎨
            </p>
          </div>
          <div className="relative flex justify-center" style={{ height: 14 }}>
            <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid #8174e0" }} />
          </div>
        </div>

        <motion.img
          src={blinkySvg}
          alt="Blinky"
          style={{ width: 90 }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          data-testid="img-blinky"
        />
      </motion.div>

      <motion.div className="px-5 mb-3 flex-shrink-0" {...fadeUp(0.18)}>
        <h2
          className="text-[18px] font-bold text-[#282145]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          data-testid="text-section-games"
        >
          Games
        </h2>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-4">
          <GameCard
            title="Quick Sketch"
            badge="3 min drawing"
            description={prompt ? `Draw: ${prompt.word}` : "Clear your mind and get ready to create!"}
            icon={<Paintbrush size={18} color="#5fa6fc" strokeWidth={2.5} />}
            accentColor="#5fa6fc"
            bgColor="#edf4ff"
            textColor="#022c5f"
            onClick={() => setLocation("/game/sketch/intro")}
            testId="card-game-sketch"
            delay={0.22}
          />

          <GameCard
            title={displayQuiz ? `${displayQuiz.title} ${displayQuiz.emoji}` : "Quick Quizz"}
            badge={displayQuiz?.badge ?? "5 min quiz"}
            description={
              displayQuiz
                ? displayQuiz.description
                : "Test your knowledge and discover something new!"
            }
            icon={<Zap size={18} color="#8174e0" strokeWidth={2} fill="#8174e0" />}
            accentColor="#8174e0"
            bgColor="#f0f1fd"
            textColor="#282145"
            onClick={() => setLocation(quizRoute)}
            testId="card-game-quiz"
            delay={0.3}
          />

          <GameCard
            title="Emoji Rebus"
            badge="5 min rebus"
            description={`Decode emoji puzzles about ${getCurrentSubject() ?? "your interests"}`}
            icon={<span style={{ fontSize: 18 }}>🧩</span>}
            accentColor="#f0a030"
            bgColor="#fff8e6"
            textColor="#3d2a00"
            onClick={() => setLocation("/rebus")}
            testId="card-game-rebus"
            delay={0.38}
          />

          <GameCard
            title="Breathe"
            badge="3 min chill"
            description="Take a mindful break — match your breath to the circle."
            icon={<Wind size={18} color="#5ecba1" strokeWidth={2.5} />}
            accentColor="#5ecba1"
            bgColor="#edfaf5"
            textColor="#1a3d35"
            onClick={() => setLocation("/meditation/intro")}
            testId="card-game-meditation"
            delay={0.44}
          />

          <GameCard
            title="Speed Round"
            badge="1 min drawing"
            description="Draw as fast as you can — no second-guessing allowed!"
            icon={<Sparkles size={18} color="#9FA9BB" strokeWidth={2.5} />}
            accentColor="#9FA9BB"
            bgColor="#f6f7f8"
            textColor="#595c5d"
            locked
            testId="card-game-speed"
            delay={0.38}
          />

          <GameCard
            title="Daily Challenge"
            badge="new today"
            description="A new prompt every day. Can you nail it in one try?"
            icon={<Sparkles size={18} color="#e07474" strokeWidth={2.5} />}
            accentColor="#e07474"
            bgColor="#fdf0f0"
            textColor="#5f0202"
            locked
            testId="card-game-daily"
            delay={0.38}
          />
        </div>
      </div>

      <BottomNav />
      <HomeIndicator />
    </MobileShell>
  );
};
