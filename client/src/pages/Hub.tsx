import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Flame, CheckCircle2, Zap, Wind, Paintbrush } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import type { ActivitySession } from "@shared/schema";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 280, damping: 24, delay },
});

interface StatsResponse {
  totalSessions: number;
  totalTimeSeconds: number;
  thisWeekSessions: number;
  thisWeekTimeSeconds: number;
  byType: Record<string, number>;
  recentSessions: ActivitySession[];
}

interface MeditationSummary {
  streak: number;
  completedToday: boolean;
}

function formatTime(seconds: number): { value: string; unit: string } {
  if (seconds === 0) return { value: "0", unit: "min" };
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return { value: "1", unit: "min" };
  if (mins < 60) return { value: String(mins), unit: "min" };
  const hrs = (seconds / 3600).toFixed(1);
  return { value: hrs, unit: "hrs" };
}

function formatTimeShort(seconds: number): string {
  if (seconds === 0) return "0 min";
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return "1 min";
  if (mins < 60) return `${mins} min`;
  const hrs = (seconds / 3600).toFixed(1);
  return `${hrs} hrs`;
}

function levelFromXp(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpToNext = 100 - xpInLevel;
  const progressPct = xpInLevel;
  return { level, xpInLevel, xpToNext, progressPct };
}

function relativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return diffHrs === 1 ? "1 hr ago" : `${diffHrs} hrs ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

const ACTIVITY_META: Record<string, { label: string; Icon: typeof Wind; color: string; bg: string }> = {
  meditation: { label: "Meditation", Icon: Wind, color: "#5ecba1", bg: "#edfaf5" },
  quiz: { label: "Quiz", Icon: Zap, color: "#8174e0", bg: "#f0f1fd" },
  sketch: { label: "Sketch", Icon: Paintbrush, color: "#f0a030", bg: "#fff8e6" },
};

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  delay,
}: {
  icon: typeof Wind;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  delay: number;
}) {
  const Icon = icon;
  return (
    <motion.div
      className="bg-white rounded-[18px] p-[18px] flex flex-col justify-between"
      style={{ minHeight: 130, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      {...fadeUp(delay)}
      data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: 40, height: 40, background: iconBg }}
      >
        <Icon size={20} color={iconColor} strokeWidth={2.2} />
      </div>
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.55px] mb-1"
          style={{ color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-[22px] font-bold leading-none"
          style={{ color: "#1e293b", fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[11px] mt-[3px]" style={{ color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface AchievementBadge {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  earned: boolean;
}

function BadgeItem({ badge }: { badge: AchievementBadge }) {
  return (
    <div className="flex flex-col items-center gap-[6px]" data-testid={`badge-${badge.label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-[26px]"
        style={{
          background: badge.earned ? badge.bg : "#f1f5f9",
          border: `2px solid ${badge.earned ? badge.color : "#e2e8f0"}`,
          opacity: badge.earned ? 1 : 0.45,
          filter: badge.earned ? "none" : "grayscale(1)",
        }}
      >
        {badge.emoji}
      </div>
      <span
        className="text-[11px] font-semibold text-center leading-tight"
        style={{ color: badge.earned ? "#1e293b" : "#94a3b8", fontFamily: "'Inter', sans-serif", maxWidth: 56 }}
      >
        {badge.label}
      </span>
    </div>
  );
}

export const Hub = (): JSX.Element => {
  const { user } = useAuth();
  const xp = user?.xp ?? 0;
  const { level, xpToNext, progressPct } = levelFromXp(xp);

  const { data: stats, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  const { data: meditation } = useQuery<MeditationSummary>({
    queryKey: ["/api/meditation/recent"],
  });

  const totalTime = formatTime(stats?.totalTimeSeconds ?? 0);
  const thisWeekTime = formatTimeShort(stats?.thisWeekTimeSeconds ?? 0);
  const streak = meditation?.streak ?? 0;
  const totalSessions = stats?.totalSessions ?? 0;
  const byType = stats?.byType ?? {};

  const achievements: AchievementBadge[] = [
    { label: "First Win", emoji: "⚡", color: "#f0c040", bg: "#fff8e6", earned: totalSessions >= 1 },
    { label: "On Fire", emoji: "🔥", color: "#f06040", bg: "#fff1ee", earned: streak >= 3 || totalSessions >= 5 },
    { label: "Quiz Ace", emoji: "🧠", color: "#8174e0", bg: "#f0f1fd", earned: (byType["quiz"] ?? 0) >= 1 },
    { label: "Artist", emoji: "🎨", color: "#f0a030", bg: "#fff8e6", earned: (byType["sketch"] ?? 0) >= 1 },
  ];

  const recentSessions = stats?.recentSessions ?? [];

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-3 pb-2 flex flex-col gap-4">
        {/* Page title */}
        <motion.h1
          className="text-[28px] font-bold text-[#1e293b] leading-[36px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          {...fadeUp(0)}
          data-testid="text-hub-title"
        >
          Your Progress
        </motion.h1>

        {/* Hero stat card */}
        <motion.div
          className="rounded-[20px] p-5 relative overflow-hidden"
          style={{ background: "#8174e0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", minHeight: 140 }}
          {...fadeUp(0.06)}
          data-testid="card-hero-stats"
        >
          {/* Decorative circles — painted first so they sit behind text */}
          <div
            className="absolute rounded-full"
            style={{ background: "rgba(255,255,255,0.18)", width: 90, height: 90, right: -18, top: -18, zIndex: 0 }}
          />
          <div
            className="absolute rounded-full"
            style={{ background: "rgba(255,255,255,0.13)", width: 64, height: 64, right: 42, top: 10, zIndex: 0 }}
          />
          <div
            className="absolute rounded-full"
            style={{ background: "rgba(255,255,255,0.09)", width: 50, height: 50, right: 12, bottom: -10, zIndex: 0 }}
          />

          {/* Content — always on top */}
          <div className="relative flex flex-col gap-2" style={{ zIndex: 1 }}>
            <p
              className="text-white text-[18px] font-semibold leading-[24px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif", opacity: 0.85 }}
            >
              Total Time Saved
            </p>

            <div className="flex items-baseline gap-[6px]">
              <span
                className="text-white font-extrabold leading-none"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 52 }}
                data-testid="text-total-time-value"
              >
                {statsLoading ? "—" : totalTime.value}
              </span>
              {!statsLoading && (
                <span
                  className="text-white font-bold uppercase tracking-[0.5px]"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, opacity: 0.9 }}
                >
                  {totalTime.unit}
                </span>
              )}
            </div>

            <div
              className="self-start inline-flex items-center gap-[6px] px-3 py-[5px] rounded-full"
              style={{ background: "rgba(255,255,255,0.22)" }}
            >
              <CheckCircle2 size={12} color="white" strokeWidth={2.5} />
              <span
                className="text-white font-semibold"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}
              >
                {totalSessions} activit{totalSessions === 1 ? "y" : "ies"} completed
              </span>
            </div>
          </div>
        </motion.div>

        {/* Level progress */}
        <motion.div className="px-1 flex flex-col gap-3" {...fadeUp(0.12)}>
          <div className="flex items-end justify-between">
            <span
              className="text-[22px] font-bold text-[#1e293b]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-level"
            >
              Level {level}
            </span>
            <span
              className="text-[14px] font-semibold"
              style={{ color: "#624ab8", fontFamily: "'Inter', sans-serif" }}
              data-testid="text-level-progress"
            >
              {progressPct}%
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "#d9d9d9" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#9590e9", boxShadow: "0 0 8px rgba(99,102,241,0.4)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
              data-testid="bar-xp-progress"
            />
          </div>
          <p
            className="text-[11px] tracking-[0.275px]"
            style={{ color: "#64748b", fontFamily: "'Inter', sans-serif" }}
          >
            {xpToNext} XP until Level {level + 1}
          </p>
        </motion.div>

        {/* 2×2 Stats grid */}
        <div
          className="grid grid-cols-2 gap-3"
          data-testid="grid-stats"
        >
          <StatCard
            icon={Clock}
            iconBg="#fff8e6"
            iconColor="#f0a030"
            label="This week"
            value={thisWeekTime}
            sub={`${stats?.thisWeekSessions ?? 0} session${(stats?.thisWeekSessions ?? 0) === 1 ? "" : "s"}`}
            delay={0.16}
          />
          <StatCard
            icon={Flame}
            iconBg="#fff1ee"
            iconColor="#f06040"
            label="Streak"
            value={`${streak} day${streak === 1 ? "" : "s"}`}
            sub="meditation"
            delay={0.2}
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="#f0f1fd"
            iconColor="#8174e0"
            label="Completed"
            value={String(totalSessions)}
            sub="all activities"
            delay={0.24}
          />
          <StatCard
            icon={Zap}
            iconBg="#f0f1fd"
            iconColor="#55429e"
            label="Total XP"
            value={String(xp)}
            sub="points earned"
            delay={0.28}
          />
        </div>

        {/* Achievements */}
        <motion.div className="flex flex-col gap-3" {...fadeUp(0.32)}>
          <div className="flex items-center justify-between px-1">
            <span
              className="text-[20px] font-bold text-[#1e293b]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Achievements
            </span>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "#8174e0", fontFamily: "'Inter', sans-serif" }}
            >
              {achievements.filter((a) => a.earned).length}/{achievements.length}
            </span>
          </div>
          <div
            className="bg-white rounded-[18px] p-4 flex items-center justify-around"
            style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            data-testid="section-achievements"
          >
            {achievements.map((badge) => (
              <BadgeItem key={badge.label} badge={badge} />
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        {recentSessions.length > 0 && (
          <motion.div className="flex flex-col gap-3 pb-2" {...fadeUp(0.38)}>
            <span
              className="text-[20px] font-bold text-[#1e293b] px-1"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Recent Activity
            </span>
            <div
              className="bg-white rounded-[18px] overflow-hidden"
              style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
              data-testid="section-recent-activity"
            >
              {recentSessions.slice(0, 4).map((session, i) => {
                const meta = ACTIVITY_META[session.activityType] ?? ACTIVITY_META["quiz"];
                const Icon = meta.Icon;
                const isLast = i === Math.min(recentSessions.length, 4) - 1;
                return (
                  <div
                    key={String(session.id)}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: isLast ? "none" : "1px solid #f8fafc" }}
                    data-testid={`row-activity-${i}`}
                  >
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 42, height: 42, background: meta.bg }}
                    >
                      <Icon size={20} color={meta.color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[15px] font-semibold text-[#1e293b] leading-tight"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {meta.label}
                      </p>
                      <p
                        className="text-[12px] mt-[2px]"
                        style={{ color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
                      >
                        {formatTimeShort(session.durationSeconds)} · {relativeTime(session.completedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state for recent activity */}
        {!statsLoading && recentSessions.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-6 gap-2 opacity-60"
            {...fadeUp(0.38)}
          >
            <span className="text-3xl">🎯</span>
            <p
              className="text-[14px] text-center"
              style={{ color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
            >
              Complete your first activity to see stats here!
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
      <HomeIndicator />
    </MobileShell>
  );
};
