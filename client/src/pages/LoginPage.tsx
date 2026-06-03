import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import blinkySvg from "@assets/Blinky_1779363256568.svg";

type Mode = "sign-in" | "sign-up";

export const LoginPage = (): JSX.Element => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Compte créé ! Vérifie tes emails pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <MobileShell>
      <StatusBar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-0">
        <motion.div
          className="flex flex-col items-center mb-2"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
        >
          <motion.img
            src={blinkySvg}
            alt="Blinky"
            style={{ width: 160 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.22 }}
        >
          <h1
            className="text-[38px] font-bold text-[#282145] leading-none"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Blink
          </h1>
          <p
            className="text-[15px] text-[#595c5d] text-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Learn a little every day.
          </p>
        </motion.div>

        <motion.div
          className="w-full flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.34 }}
        >
          {/* Google OAuth */}
          <button
            data-testid="button-sign-in-google"
            onClick={handleGoogle}
            className="w-full h-[56px] rounded-[28px] flex items-center justify-center gap-3"
            style={{ background: "#282145", boxShadow: "0px 4px 0px black" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span
              className="text-white text-[16px] font-bold"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Continuer avec Google
            </span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-[12px] text-[#9FA9BB]" style={{ fontFamily: "'Inter', sans-serif" }}>
              ou par email
            </span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-[52px] rounded-[26px] px-5 text-[15px] border-2 border-[#e5e7eb] bg-white outline-none focus:border-[#9590e9]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <input
              data-testid="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              minLength={6}
              className="w-full h-[52px] rounded-[26px] px-5 text-[15px] border-2 border-[#e5e7eb] bg-white outline-none focus:border-[#9590e9]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-[13px] text-center px-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#5ecba1] text-[13px] text-center px-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              data-testid="button-submit-auth"
              type="submit"
              disabled={loading}
              className="w-full h-[56px] rounded-[28px] flex items-center justify-center mt-1"
              style={{
                background: loading ? "#9590e9" : "#55429e",
                boxShadow: loading ? "none" : "0px 4px 0px #282145",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {loading ? "..." : mode === "sign-in" ? "Se connecter" : "Créer un compte"}
            </button>
          </form>

          <button
            data-testid="button-toggle-mode"
            onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); setSuccess(null); }}
            className="text-[13px] text-[#9590e9] text-center underline"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {mode === "sign-in" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>

          <p
            className="text-center text-[11px] text-[#9FA9BB] leading-[16px] px-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            En continuant, tu acceptes nos conditions d'utilisation.
          </p>
        </motion.div>
      </div>

      <HomeIndicator />
    </MobileShell>
  );
};
