import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { useAuth } from "@/hooks/use-auth";

export const Homepage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (user?.onboardingCompleted) {
          setLocation("/start");
        } else {
          setLocation("/onboarding/intro");
        }
      }, 2200);
      return () => clearTimeout(timer);
    }

    const fallback = setTimeout(() => {
      setLocation("/onboarding/intro");
    }, 3000);
    return () => clearTimeout(fallback);
  }, [isLoading, user, setLocation]);

  return (
    <MobileShell>
      <StatusBar />
      <div className="flex flex-1 items-center justify-center">
        <motion.img
          src="/figmaAssets/blink.svg"
          alt="Blink"
          className="w-64 h-64 rounded-[32px]"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        />
      </div>
      <HomeIndicator />
    </MobileShell>
  );
};
