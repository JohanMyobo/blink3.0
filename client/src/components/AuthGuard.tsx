import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LoginPage } from "@/pages/LoginPage";
import { MobileShell } from "@/components/MobileShell";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

interface AuthGuardProps {
  children: React.ReactNode;
}

function LoadingScreen() {
  return (
    <MobileShell>
      <div className="flex-1 flex items-center justify-center">
        <motion.img
          src={blinkySvg}
          alt="Loading"
          style={{ width: 120 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </MobileShell>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
