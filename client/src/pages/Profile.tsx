import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Plus, Check, Star, LogOut, Flame, Wind } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { BottomNav } from "@/components/BottomNav";
import {
  getUserSubjects,
  saveUserSubjects,
  generateQuizFromSubjects,
  resetSubjectRotation,
  getUserName,
} from "@/lib/quizData";
import {
  CATEGORIES,
  getPreferredCategories,
  savePreferredCategories,
} from "@/lib/prompts";
import type { User as UserType } from "@shared/models/auth";

const XP_LEVELS = [
  { level: 1, label: "Rookie", minXp: 0, maxXp: 100 },
  { level: 2, label: "Sketcher", minXp: 100, maxXp: 250 },
  { level: 3, label: "Artist", minXp: 250, maxXp: 500 },
  { level: 4, label: "Pro", minXp: 500, maxXp: 1000 },
  { level: 5, label: "Master", minXp: 1000, maxXp: 2000 },
  { level: 6, label: "Legend", minXp: 2000, maxXp: Infinity },
];

function getXpLevel(xp: number) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXp) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

export const Profile = (): JSX.Element => {
  const userName = getUserName();
  const { logout, isLoggingOut } = useAuth();

  const { data: authUser } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: meditation } = useQuery<{
    streak: number;
    completedToday: boolean;
    last7: { date: string; completed: boolean }[];
    totalSessions: number;
  }>({
    queryKey: ["/api/meditation/recent"],
    staleTime: 60_000,
  });

  const totalXp = authUser?.xp ?? 0;
  const currentLevel = getXpLevel(totalXp);
  const nextLevel = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressXp = totalXp - currentLevel.minXp;
  const rangeXp = nextLevel ? nextLevel.minXp - currentLevel.minXp : 1;
  const progressPct = nextLevel ? Math.min(100, Math.round((progressXp / rangeXp) * 100)) : 100;

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = getUserSubjects();
    return saved.length > 0 ? saved : [""];
  });
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const lastInputRef = useRef<HTMLInputElement>(null);

  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    () => getPreferredCategories()
  );
  const [categoriesSaved, setCategoriesSaved] = useState(true);

  const hasAny = subjects.some(s => s.trim().length > 0);
  const isDirty = !saved;

  const updateSubject = (i: number, value: string) => {
    setSubjects(prev => prev.map((s, idx) => (idx === i ? value : s)));
    setSaved(false);
  };

  const removeSubject = (i: number) => {
    setSubjects(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length === 0 ? [""] : next;
    });
    setSaved(false);
  };

  const addSubject = () => {
    setSubjects(prev => [...prev, ""]);
    setSaved(false);
    setTimeout(() => lastInputRef.current?.focus(), 80);
  };

  const handleSave = async () => {
    if (!hasAny || isSaving) return;
    const filtered = subjects.filter(s => s.trim().length > 0);
    saveUserSubjects(filtered);
    resetSubjectRotation();
    setIsSaving(true);
    generateQuizFromSubjects([filtered[0]]).finally(() => {
      setIsSaving(false);
      setSaved(true);
    });
  };

  const toggleCategory = (id: string) => {
    setPreferredCategories(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      savePreferredCategories(next);
      return next;
    });
    setCategoriesSaved(false);
    setTimeout(() => setCategoriesSaved(true), 1200);
  };

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex-1 overflow-y-auto pb-2" style={{ scrollbarWidth: "none" }}>

        <motion.div
          className="flex flex-col items-center pt-6 pb-5 px-5"
          {...fadeUp(0.05)}
        >
          <div
            className="flex items-center justify-center w-20 h-20 rounded-[24px] mb-3"
            style={{ background: "#f0f1fd", border: "2px solid #8174e0", boxShadow: "0px 3px 0px #8174e0" }}
          >
            <User size={36} color="#8174e0" strokeWidth={2} />
          </div>
          <h1
            className="text-[26px] font-bold text-[#282145] uppercase"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            data-testid="text-profile-title"
          >
            {userName ? userName : "My Profile"}
          </h1>
          {userName ? (
            <p
              className="text-[13px] text-[#9FA9BB] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              My Profile
            </p>
          ) : null}
        </motion.div>

        <motion.div className="px-5 mb-4 flex-shrink-0" {...fadeUp(0.1)}>
          <div
            className="rounded-[24px] p-5"
            style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2
                  className="text-[18px] font-bold text-[#282145]"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  data-testid="text-xp-total"
                >
                  {totalXp} XP
                </h2>
                <p
                  className="text-[12px] text-[#9FA9BB] mt-[2px]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Total earned
                </p>
              </div>
              <div
                className="flex items-center gap-[6px] px-3 py-2 rounded-[14px]"
                style={{ background: "#f0f1fd", border: "1.5px solid #8174e0" }}
                data-testid="text-xp-level"
              >
                <Star size={14} color="#8174e0" strokeWidth={2.5} fill="#8174e0" />
                <span
                  className="text-[13px] font-bold text-[#8174e0]"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Lv {currentLevel.level} · {currentLevel.label}
                </span>
              </div>
            </div>

            <div className="w-full h-[10px] rounded-full bg-[#f0f1fd] overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#8174e0" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: [0.34, 1.2, 0.64, 1], delay: 0.2 }}
                data-testid="xp-progress-bar"
              />
            </div>

            {nextLevel ? (
              <p
                className="text-[12px] text-[#9FA9BB] text-right"
                style={{ fontFamily: "'Inter', sans-serif" }}
                data-testid="text-xp-next-level"
              >
                {progressXp} / {rangeXp} XP to {nextLevel.label}
              </p>
            ) : (
              <p
                className="text-[12px] text-[#8174e0] font-semibold text-right"
                style={{ fontFamily: "'Inter', sans-serif" }}
                data-testid="text-xp-maxed"
              >
                Max level reached!
              </p>
            )}
          </div>
        </motion.div>

        {meditation && (
          <motion.div className="px-5 mb-4 flex-shrink-0" {...fadeUp(0.11)}>
            <div
              className="rounded-[24px] p-5"
              style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
              data-testid="meditation-streak-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wind size={18} color="#5ecba1" strokeWidth={2.5} />
                  <h2
                    className="text-[18px] font-bold text-[#282145]"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Meditation
                  </h2>
                </div>
                <div
                  className="flex items-center gap-[6px] px-3 py-2 rounded-[14px]"
                  style={{ background: "#fff4e6", border: "1.5px solid #ffd9a8" }}
                >
                  <Flame size={14} color="#f97316" strokeWidth={2.5} />
                  <span
                    className="text-[13px] font-bold"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#c2410c" }}
                    data-testid="text-profile-meditation-streak"
                  >
                    {meditation.streak} day{meditation.streak === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <p
                className="text-[13px] text-[#9FA9BB] mb-3 leading-[18px]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {meditation.streak > 0
                  ? meditation.completedToday
                    ? "Nice — you've already breathed today. Keep it going tomorrow."
                    : "Take a quick breath today to keep your streak alive."
                  : "Take a mindful break today to start a streak."}
              </p>
              <div className="flex items-center justify-between" data-testid="profile-last-7-days">
                {meditation.last7.map((day, idx) => {
                  const dt = new Date(day.date + "T00:00:00");
                  const dow = dt.getDay();
                  const letter = ["S", "M", "T", "W", "T", "F", "S"][dow];
                  const isToday = idx === meditation.last7.length - 1;
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center gap-1"
                      data-testid={`profile-day-${day.date}`}
                    >
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          color: isToday ? "#282145" : "#9FA9BB",
                        }}
                      >
                        {letter}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: day.completed ? "#5ecba1" : "white",
                          border: `1.5px solid ${
                            day.completed ? "#5ecba1" : isToday ? "#282145" : "#e9e9f0"
                          }`,
                        }}
                      >
                        {day.completed && (
                          <Check size={13} color="white" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className="px-5 mb-4 flex-shrink-0" {...fadeUp(0.12)}>
          <div
            className="rounded-[24px] p-5"
            style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-[18px] font-bold text-[#282145]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                My Interests
              </h2>
              {saved && subjects.some(s => s.trim()) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full"
                  style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}
                >
                  <Check size={12} color="#16a34a" strokeWidth={2.5} />
                  <span className="text-[12px] font-semibold text-green-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Saved
                  </span>
                </motion.div>
              )}
            </div>

            <p
              className="text-[13px] text-[#9FA9BB] mb-4 leading-[18px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Blinky generates a personalised quiz for each topic in order.
            </p>

            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {subjects.map((subject, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 relative">
                      <input
                        ref={i === subjects.length - 1 ? lastInputRef : undefined}
                        type="text"
                        value={subject}
                        onChange={e => updateSubject(i, e.target.value)}
                        placeholder="Add a topic (e.g. Pokémon)"
                        data-testid={`input-subject-${i}`}
                        className="w-full h-[52px] bg-[#f6f7f8] rounded-xl px-4 text-[17px] font-bold text-[#282145] placeholder:font-normal placeholder:text-[#9FA9BB] outline-none transition-colors"
                        style={{
                          border: "2px solid #e9e9f0",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#8174e0")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#e9e9f0")}
                      />
                    </div>
                    {subjects.length > 1 || subject.trim() ? (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => removeSubject(i)}
                        data-testid={`button-remove-subject-${i}`}
                        className="flex items-center justify-center w-[44px] h-[44px] rounded-full flex-shrink-0"
                        style={{ background: "#fdf0f0", border: "2px solid #f8c3c3" }}
                      >
                        <X size={16} color="#e07474" strokeWidth={2.5} />
                      </motion.button>
                    ) : (
                      <div className="w-[44px] h-[44px] flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                onClick={addSubject}
                data-testid="button-add-subject"
                className="w-full flex items-center justify-center gap-2 py-[14px] rounded-[20px] mt-1"
                style={{ background: "#f6f7f8", border: "2px dashed #d0d4db" }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-6 h-6 rounded-full bg-[#8174e0] flex items-center justify-center">
                  <Plus size={14} color="white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-[14px] font-semibold text-[#595c5d]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Add topic
                </span>
              </motion.button>
            </div>

            <AnimatePresence>
              {isDirty && hasAny && (
                <motion.button
                  key="save-btn"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  data-testid="button-save-interests"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-[56px] rounded-[24px] flex items-center justify-center mt-4"
                  style={{
                    background: "#282145",
                    boxShadow: "0px 4px 0px black",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      <span
                        className="text-[17px] font-bold text-[#f0f1fd]"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                      >
                        Saving…
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-[17px] font-bold text-[#f0f1fd]"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Save interests
                    </span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div className="px-5 mb-4 flex-shrink-0" {...fadeUp(0.2)}>
          <div
            className="rounded-[24px] p-5"
            style={{ background: "white", border: "2px solid #e9e9f0", boxShadow: "0px 3px 0px #e9e9f0" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2
                className="text-[18px] font-bold text-[#282145]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                data-testid="text-drawing-categories-title"
              >
                Drawing Categories
              </h2>
              <AnimatePresence>
                {categoriesSaved && preferredCategories.length > 0 && (
                  <motion.div
                    key="cat-saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}
                  >
                    <Check size={12} color="#16a34a" strokeWidth={2.5} />
                    <span className="text-[12px] font-semibold text-green-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Saved
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p
              className="text-[13px] text-[#9FA9BB] mb-4 leading-[18px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Pick the topics you want to draw. All categories are used when none are selected.
            </p>

            <div className="flex flex-wrap gap-2" data-testid="drawing-categories-grid">
              {CATEGORIES.map((cat) => {
                const isSelected = preferredCategories.includes(cat.id);
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleCategory(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                    className="flex items-center gap-[6px] px-3 py-2 rounded-[14px] transition-colors"
                    style={{
                      background: isSelected ? "#282145" : "#f6f7f8",
                      border: `2px solid ${isSelected ? "#282145" : "#e9e9f0"}`,
                      boxShadow: isSelected ? "0px 2px 0px black" : "none",
                    }}
                  >
                    <span className="text-[16px] leading-none">{cat.emoji}</span>
                    <span
                      className="text-[13px] font-semibold leading-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isSelected ? "#f0f1fd" : "#595c5d",
                      }}
                    >
                      {cat.label}
                    </span>
                    {isSelected && (
                      <Check size={12} color="#f0f1fd" strokeWidth={2.5} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {preferredCategories.length === 0 && (
              <p
                className="text-[12px] text-[#9FA9BB] mt-3 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
                data-testid="text-all-categories-hint"
              >
                All categories active
              </p>
            )}
          </div>
        </motion.div>

        <motion.div className="px-5 mb-6 flex-shrink-0" {...fadeUp(0.28)}>
          <button
            data-testid="button-sign-out"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full h-[56px] rounded-[24px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: "white",
              border: "2px solid #f8c3c3",
              boxShadow: "0px 3px 0px #f8c3c3",
            }}
          >
            {isLoggingOut ? (
              <motion.div
                className="w-4 h-4 border-2 rounded-full"
                style={{ borderColor: "#e07474", borderTopColor: "transparent" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <LogOut size={18} color="#e07474" strokeWidth={2.5} />
            )}
            <span
              className="text-[16px] font-semibold text-[#e07474]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </motion.div>

      </div>

      <BottomNav />
      <HomeIndicator />
    </MobileShell>
  );
};
