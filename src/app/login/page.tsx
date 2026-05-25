"use client";

import React, { useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, Lock, Cpu, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "SECURE GATEWAY v3.4.15 // SYNC: ONLINE",
    "ENTER CREDENTIALS TO ACCESS SYSTEM ANALYTICS...",
  ]);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Matrix Digital Rain Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Characters (numbers and hex symbols for hacker vibe)
    const chars = "010101010101ABCDEFUX@#$&%*".split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#A3FF12";
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw character with neon glow factor
        ctx.shadowColor = "#A3FF12";
        ctx.shadowBlur = Math.random() > 0.98 ? 8 : 0;
        ctx.fillText(text, x, y);

        // Reset drops
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const appendOutput = (text: string) => {
    setTerminalOutput((prev) => [...prev, text]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setErrorMsg("ERR: HACKER_ID IS REQUIRED");
      return;
    }

    setErrorMsg("");
    setIsDecrypting(true);
    setDecryptProgress(0);
    appendOutput(`$ decrypt --user ${username}`);
    appendOutput("CONNECTING TO AUTHENTICATION SERVER...");

    // Decryption progress bar simulation
    const interval = setInterval(() => {
      setDecryptProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          completeLogin();
          return 100;
        }
        if (next % 20 < 5) {
          appendOutput(`PARSING ENTROPY SEED... [${Math.min(99, next)}%]`);
        }
        return next;
      });
    }, 200);
  };

  const completeLogin = async () => {
    appendOutput("DECRYPTION VECTOR RESOLVED.");
    appendOutput("INITIALIZING NEXTAUTH SECURITY BINDING...");

    try {
      const result = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setIsDecrypting(false);
        setErrorMsg("ERR: CRYPTOGRAPHIC HANDSHAKE FAILED");
        appendOutput("ACCESS DENIED: KEY SIGNATURE NOT VALID.");
      } else {
        appendOutput("ACCESS GRANTED. REDIRECTING USER...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch {
      setIsDecrypting(false);
      setErrorMsg("SYSTEM EXCEPTION OCCURRED");
      appendOutput("FATAL SYSTEM EXCEPTION IN AUTH CORES.");
    }
  };

  const fillDemoCreds = () => {
    setUsername("@steipete");
    setPassword("hacker-core");
    appendOutput("LOADED SECURED PROFILE STUB: @steipete");
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4 bg-[#050505] overflow-hidden select-none">
      {/* Matrix Canvas Backdrop */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-15" />

      {/* Futuristic CRT Scanline and Vignette Effects */}
      <div className="absolute inset-0 z-10 pointer-events-none cyber-scanlines opacity-5" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,5,5,0.85)_100%)]" />

      {/* Main Terminal Box */}
      <div className="relative z-20 w-full max-w-lg">
        <GlassCard
          title="DECRYPTOR_INTERFACE // SECURITY_GATE"
          showWindowControls={true}
          hasDenseGrid={true}
          className="border-neon-green/20"
        >
          {/* Top Logo Panel */}
          <div className="flex flex-col items-center justify-center mb-6 pt-2">
            <div className="relative p-3 rounded-full bg-neon-green/5 border border-neon-green/20 mb-3 shadow-[0_0_15px_rgba(163,255,18,0.05)]">
              <Cpu className="w-8 h-8 text-neon-green animate-pulse-slow" />
              <div className="absolute inset-0 rounded-full border border-neon-green/30 animate-ping opacity-30" />
            </div>
            <h1 className="text-xl font-mono font-bold text-neon-green tracking-[0.2em] uppercase neon-text-glow">
              DEV.TERMINAL
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
              Hacker-Style Analytics Matrix
            </p>
          </div>

          {/* Terminal Logs Output */}
          <div className="h-28 overflow-y-auto bg-black/60 rounded-xl p-3 border border-neon-green/5 font-mono text-[10px] text-neon-green/75 space-y-1 mb-5 scrollbar-thin">
            {terminalOutput.map((log, index) => (
              <div key={index} className="flex items-start">
                <span className="text-neon-green/40 mr-1.5">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          {/* Login Form */}
          {!isDecrypting ? (
            <div className="space-y-5">
              {/* GitHub OAuth Login Action Button */}
              <button
                type="button"
                onClick={() => {
                  appendOutput("$ redirect --target github-oauth");
                  appendOutput("REDIRECTING TO SECURED GITHUB AUTHENTICATION NODE...");
                  setTimeout(() => {
                    signIn("github", { callbackUrl: "/dashboard" });
                  }, 500);
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neon-green/20 hover:border-neon-green text-white font-mono text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.01)] hover:shadow-[0_0_15px_rgba(163,255,18,0.1)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v-3.293c0-.319.192-.694.801-.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign In with GitHub
              </button>

              {/* Hacker-style Visual Divider */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-neon-green/10" />
                <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                  OR BYPASS ACCESS GATE
                </span>
                <div className="flex-1 h-px bg-neon-green/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    {"// ENTER_HACKER_ID"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-mono text-neon-green/50">@</span>
                    <input
                      type="text"
                      value={username.replace(/^@/, "")}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="steipete"
                      className="w-full bg-black/40 border border-neon-green/10 rounded-xl py-2.5 pl-8 pr-10 font-mono text-xs text-neon-green focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder-neutral-700"
                    />
                    <Terminal className="absolute right-3.5 w-4 h-4 text-neon-green/30" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    {"// DECRYPTION_KEY"}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-neon-green/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full bg-black/40 border border-neon-green/10 rounded-xl py-2.5 pl-10 pr-10 font-mono text-xs text-neon-green focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-neon-green/30 hover:text-neon-green/75 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Output */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-2 border border-red-500/20 bg-red-950/20 text-red-400 font-mono text-[9px] uppercase tracking-widest rounded-lg text-center"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-neon-green hover:bg-[#b5ff36] text-black font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(163,255,18,0.2)] hover:shadow-[0_0_20px_rgba(163,255,18,0.45)] cursor-pointer active:scale-[0.99]"
                  >
                    Initiate Handshake
                  </button>
                  
                  <button
                    type="button"
                    onClick={fillDemoCreds}
                    className="w-full bg-black/40 hover:bg-black/60 border border-neon-green/20 text-neon-green font-mono text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all hover:border-neon-green/50 cursor-pointer"
                  >
                    {"// Inject Demo Session"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Loading Decryption Sequence */
            <div className="flex flex-col items-center justify-center py-6 font-mono">
              <div className="text-xs text-neon-green uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 animate-spin text-neon-green" />
                Decrypting Security Vectors...
              </div>

              {/* Graphical Loading Bar */}
              <div className="w-full bg-black/60 border border-neon-green/20 h-5 rounded-lg overflow-hidden relative mb-2">
                <div
                  className="bg-neon-green h-full shadow-[0_0_10px_rgba(163,255,18,0.8)] transition-all duration-200"
                  style={{ width: `${decryptProgress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-neon-green font-bold text-center">
                  {decryptProgress}%
                </span>
              </div>
              <span className="text-[8px] text-neutral-500 uppercase tracking-widest">
                SHA-256 Entropy Decryption Matrix
              </span>
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
