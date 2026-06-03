import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { BottomNav } from "@/components/BottomNav";
import { Users } from "lucide-react";

export const Friends = (): JSX.Element => {
  return (
    <MobileShell>
      <StatusBar />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "#edf4ff", border: "2px solid #5fa6fc" }}
        >
          <Users size={32} color="#5fa6fc" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h1
            className="text-[26px] font-bold text-[#282145] uppercase"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            data-testid="text-friends-title"
          >
            Friends
          </h1>
          <p
            className="text-[14px] text-[#9FA9BB] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
            data-testid="text-friends-subtitle"
          >
            Coming soon — see what your friends are drawing here.
          </p>
        </div>
      </div>

      <BottomNav />
      <HomeIndicator />
    </MobileShell>
  );
};
