import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";

interface RebusPuzzle {
  emojis: string;
  answer: string;
  explanation: string;
  choices?: string[];
}

interface RebusResponse {
  topic: string;
  puzzles: RebusPuzzle[];
}

function splitEmojis(str: string): string[] {
  const bySpace = str.trim().split(/\s+/).filter((s) => s.length > 0);
  if (bySpace.length >= 2) return bySpace;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
    return [...seg.segment(str)]
      .map((s: any) => s.segment as string)
      .filter((s) => s.trim().length > 0);
  }
  return [...str].filter((c) => c.trim().length > 0);
}

const ACCENT = "#f0a030";
const XP_CORRECT = 10;
const XP_FAILED = 3;

const FALLBACK_PUZZLES: RebusPuzzle[] = [
  { emojis: "⚡ 🌩️ ☁️ 🔌 💡", answer: "Electricity", explanation: "Lightning + storm + cloud + plug + light bulb = electrical power!" },
  { emojis: "📖 ✏️ 🧪 🎓 🏫", answer: "Education", explanation: "Book + pencil + experiment + graduation + school = the journey of learning!" },
  { emojis: "🌱 🌧️ ☀️ 🕐 🌳", answer: "Growth", explanation: "Seedling + rain + sun + time + tree = the process of growing!" },
  { emojis: "🔬 🐛 🧬 🏥 💊", answer: "Biology", explanation: "Microscope + organism + DNA + health + medicine = the science of life!" },
  { emojis: "🌙 ✨ 🔭 🚀 🌌", answer: "Space", explanation: "Moon + stars + telescope + rocket + galaxy = the vast universe!" },
  { emojis: "🎸 🎤 🥁 🎵 🎶", answer: "Music", explanation: "Guitar + microphone + drums + notes + melody = the world of music!" },
];

type Phase = "guessing" | "correct" | "failed";

export const RebusPlay = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const topic = localStorage.getItem("rebusTopic") ?? "General Knowledge";

  const [puzzles, setPuzzles] = useState<RebusPuzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("guessing");
  const [revealCount, setRevealCount] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cardScope, animateCard] = useAnimate();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const isValidPuzzle = (p: any): p is RebusPuzzle =>
      p &&
      typeof p.emojis === "string" && p.emojis.trim().length > 0 &&
      typeof p.answer === "string" && p.answer.trim().length > 0 &&
      typeof p.explanation === "string";

    fetch("/api/rebus/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RebusResponse | null) => {
        if (cancelled) return;
        const valid = Array.isArray(data?.puzzles)
          ? data!.puzzles.filter(isValidPuzzle).slice(0, 6)
          : [];
        setPuzzles(valid.length === 6 ? valid : FALLBACK_PUZZLES);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setPuzzles(FALLBACK_PUZZLES);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [topic]);

  useEffect(() => {
    if (!isLoading && phase === "guessing") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [phase, currentIndex, isLoading]);

  useEffect(() => {
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, []);

  const puzzle = puzzles[currentIndex];
  const emojiChars = puzzle ? splitEmojis(puzzle.emojis) : [];
  const maxReveal = emojiChars.length;
  const isLast = currentIndex === puzzles.length - 1;

  const goNext = (finalScore: number, finalXp: number) => {
    if (isLast) {
      localStorage.setItem(
        "rebusResults",
        JSON.stringify({
          topic,
          correct: finalScore,
          total: puzzles.length,
          xp: finalXp,
          completedAt: new Date().toISOString(),
        }),
      );
      setLocation("/rebus/complete");
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase("guessing");
      setRevealCount(1);
      setInputValue("");
      setWrongCount(0);
    }
  };

  const handleSubmit = () => {
    if (phase !== "guessing" || !puzzle || !inputValue.trim()) return;

    const normalizeWords = (s: string) =>
      s.toLowerCase().trim().split(/\s+/).sort().join(" ");
    const isCorrect =
      normalizeWords(inputValue) === normalizeWords(puzzle.answer);

    if (isCorrect) {
      const newScore = score + 1;
      const newXp = xp + XP_CORRECT;
      setScore(newScore);
      setXp(newXp);
      setInputValue("");
      setPhase("correct");
      advanceTimer.current = setTimeout(() => goNext(newScore, newXp), 1800);
    } else {
      animateCard(cardScope.current, { x: [0, -10, 10, -7, 7, 0] }, { duration: 0.38 });
      setWrongCount((c) => c + 1);
      setInputValue("");

      if (revealCount < maxReveal) {
        setRevealCount((r) => r + 1);
      } else {
        const newXp = xp + XP_FAILED;
        setXp(newXp);
        setPhase("failed");
        advanceTimer.current = setTimeout(() => goNext(score, newXp), 2200);
      }
    }
  };

  if (isLoading || !puzzle) {
    return (
      <MobileShell>
        <StatusBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          <motion.div
            className="text-[64px]"
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          >
            🧩
          </motion.div>
          <motion.div
            className="w-10 h-10 border-[3px] rounded-full"
            style={{ borderColor: "#fde9c4", borderTopColor: ACCENT }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
          <p
            className="text-[17px] font-bold text-center"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#3d2a00" }}
          >
            Cooking up your puzzles…
          </p>
          <p
            className="text-[14px] text-center"
            style={{ fontFamily: "'Inter', sans-serif", color: "#9FA9BB" }}
          >
            Blinky is hiding emojis just for you!
          </p>
        </div>
        <HomeIndicator />
      </MobileShell>
    );
  }

  const shownEmojis = emojiChars.slice(0, revealCount);
  const hiddenCount = maxReveal - revealCount;

  const cardBg =
    phase === "correct" ? "#dcfce7" :
    phase === "failed" ? "#fef3c7" :
    "#fff8e6";
  const cardBorder =
    phase === "correct" ? "#22c55e" :
    phase === "failed" ? "#f59e0b" :
    ACCENT;

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div style={{ width: 42 }} />
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>🧩</span>
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Emoji Rebus
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

      {/* Progress */}
      <div className="flex items-center justify-between px-4 mt-1 flex-shrink-0">
        <div
          className="rounded-full px-4 py-[6px]"
          style={{ background: "#282145" }}
          data-testid="badge-progress"
        >
          <span
            className="text-white text-[18px] font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {currentIndex + 1}/{puzzles.length}
          </span>
        </div>
        <div className="flex gap-1">
          {puzzles.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                background:
                  i < currentIndex ? ACCENT :
                  i === currentIndex ? ACCENT :
                  "#e5e7eb",
              }}
            />
          ))}
        </div>
      </div>

      {/* Emoji puzzle card */}
      <motion.div
        ref={cardScope}
        key={`card-${currentIndex}`}
        className="mx-4 mt-3 rounded-[24px] px-5 py-6 flex-shrink-0 flex flex-col items-center gap-4"
        style={{
          background: cardBg,
          border: `2px solid ${cardBorder}`,
          boxShadow: `0px 3px 0px ${cardBorder}`,
          transition: "background 0.3s, border-color 0.3s",
        }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        {/* Emoji row */}
        <div className="flex items-center justify-center gap-2 min-h-[56px] flex-wrap">
          {shownEmojis.map((emoji, i) => (
            <AnimatePresence key={`${currentIndex}-emoji-${i}`}>
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: i === revealCount - 1 ? 0.05 : 0 }}
                style={{ fontSize: 42, lineHeight: 1 }}
                data-testid={`emoji-revealed-${i}`}
              >
                {emoji}
              </motion.span>
            </AnimatePresence>
          ))}

          {Array.from({ length: hiddenCount }).map((_, i) => (
            <motion.div
              key={`hidden-${currentIndex}-${i}`}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: "rgba(240,160,48,0.1)",
                border: "2px dashed rgba(240,160,48,0.35)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span style={{ fontSize: 20, opacity: 0.45 }}>❓</span>
            </motion.div>
          ))}
        </div>

        {/* Attempt dots — which hints have been revealed */}
        {phase === "guessing" && (
          <div className="flex items-center gap-[6px]">
            {emojiChars.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i < revealCount ? 10 : 8,
                  height: i < revealCount ? 10 : 8,
                  background:
                    i < revealCount - 1 ? "#ef4444" :
                    i === revealCount - 1 ? ACCENT :
                    "#e5e7eb",
                }}
              />
            ))}
          </div>
        )}

        {/* Contextual label */}
        {phase === "guessing" && (
          <p
            className="text-[13px] font-medium text-center"
            style={{ fontFamily: "'Inter', sans-serif", color: "#b08030" }}
          >
            {revealCount === 1
              ? "Can you guess from just one emoji?"
              : hiddenCount > 0
              ? `${hiddenCount} more hint${hiddenCount > 1 ? "s" : ""} remaining`
              : "Last chance — this is the final hint!"}
          </p>
        )}

        {/* Correct feedback */}
        <AnimatePresence>
          {phase === "correct" && (
            <motion.div
              className="flex flex-col items-center gap-2 w-full"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <p
                className="text-[20px] font-bold text-[#22c55e]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-correct"
              >
                ✓ Correct! +{XP_CORRECT} XP
              </p>
              <div className="bg-white/70 rounded-[12px] px-4 py-3 w-full">
                <p
                  className="text-[#282145] text-[13px] leading-[19px] text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {puzzle.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Failed feedback */}
        <AnimatePresence>
          {phase === "failed" && (
            <motion.div
              className="flex flex-col items-center gap-2 w-full"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <p
                className="text-[14px] text-[#9FA9BB] text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                The answer was
              </p>
              <p
                className="text-[24px] font-bold text-[#282145]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-answer"
              >
                {puzzle.answer}
              </p>
              <div className="bg-white/70 rounded-[12px] px-4 py-3 w-full">
                <p
                  className="text-[#282145] text-[13px] leading-[19px] text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {puzzle.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Text input + submit — only when guessing */}
      <AnimatePresence>
        {phase === "guessing" && (
          <motion.div
            className="flex flex-col gap-3 mx-4 mt-4 flex-shrink-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Input field */}
            <div
              className="flex items-center gap-2 bg-white rounded-[16px] px-4 py-[14px]"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "2px solid #f0e8d8" }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="Type your guess…"
                data-testid="input-guess"
                className="flex-1 text-[17px] font-medium text-[#282145] bg-transparent outline-none placeholder:text-[#c0bfbf]"
                style={{ fontFamily: "'Inter', sans-serif" }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>

            {/* Submit button */}
            <button
              data-testid="button-submit"
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="w-full h-[56px] rounded-[30px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
              style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
            >
              <span
                className="text-white text-[18px] font-bold"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Submit Guess
              </span>
              <ArrowRight size={20} color="white" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />
      <HomeIndicator />
    </MobileShell>
  );
};
