"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, CornerDownLeft } from "lucide-react";

export const InteractiveTerminal: React.FC = () => {
  const { 
    terminalHistory, 
    addTerminalCommand, 
    clearTerminalHistory, 
    isTerminalExpanded, 
    toggleTerminalExpanded,
    triggerHackSimulate,
    profile
  } = useDashboardStore();

  const [inputVal, setInputVal] = useState("");
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of terminal output
  useEffect(() => {
    if (isTerminalExpanded) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, isTerminalExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    // Add command to terminal history
    addTerminalCommand(cmd, `executing: ${cmd}...`, "input");
    setInputVal("");

    // Command parser logic
    setTimeout(() => {
      const parts = cmd.toLowerCase().split(" ");
      const mainCmd = parts[0];

      switch (mainCmd) {
        case "help":
          addTerminalCommand(
            cmd,
            "AVAILABLE CORE COMMANDS:\n" +
            "  sysinfo   - Display system environment and kernel metrics\n" +
            "  stats     - Print developer profile statistics index\n" +
            "  hack      - Bypass gateway security & override CI test suites\n" +
            "  clear     - Wipe command history cache\n" +
            "  about     - Explains the system build details\n" +
            "  help      - Print this guide instructions",
            "system"
          );
          break;
        case "sysinfo":
          addTerminalCommand(
            cmd,
            `SECURE TERMINAL KERNEL v15.0.3 // OS: WINDOWS // PROTOCOL: SHIELD-SECURED // ACTIVE CORE NODES: 7\nUPTIME: ${Math.floor(performance.now() / 1000)}s // LATENCY: 22ms // STATUS: ONLINE`,
            "system"
          );
          break;
        case "stats":
          addTerminalCommand(
            cmd,
            `DEVELOPER STATS FOR ${profile.handle}:\n` +
            `  - Trust Score: ${profile.trustScore}/100 (${profile.trustRating})\n` +
            `  - Github Age: ${profile.githubAge}\n` +
            `  - Network Reach: ${profile.followers}\n` +
            `  - Commits in Cycle: ${profile.stats.commits}\n` +
            `  - Pull Requests: ${profile.stats.prs}\n` +
            `  - Open Issues: ${profile.stats.issues}`,
            "success"
          );
          break;
        case "clear":
          clearTerminalHistory();
          break;
        case "about":
          addTerminalCommand(
            cmd,
            "DEVELOPER.TERMINAL: Built using Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, and Zustand state core. Retro-cyberpunk analytics tracker, styled under release.bar.",
            "success"
          );
          break;
        case "hack":
          addTerminalCommand(
            cmd,
            "OVERRIDING ENCRYPTION CORES...\n" +
            "BYPASSING AUTOMATED REPOSITORY INTEGRITY CHECKS...\n" +
            "SETTING WORKFLOW PIPELINES STATUS: SUCCESS\n" +
            "INJECTING COMMIT METRICS +42...\n" +
            "UPDATING GLOBAL TRUST MATRIX TO 99...",
            "error"
          );
          
          setTimeout(() => {
            triggerHackSimulate();
            addTerminalCommand("payload-inject", "HACK INJECTION COMPLETE. ALL SYSTEMS FULLY OPERATIONAL. ACCELERATING MATRIX.", "success");
          }, 1200);
          break;
        default:
          addTerminalCommand(
            cmd,
            `ERR: COMMAND NOT RESOLVED: "${cmd}". Type 'help' for available instruction keys.`,
            "error"
          );
      }
    }, 200);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 border-t border-neon-green/20 backdrop-blur-lg transition-all duration-300 font-mono shadow-[0_-15px_40px_rgba(0,0,0,0.8)] ${
        isTerminalExpanded ? "h-72" : "h-12"
      }`}
    >
      {/* Terminal Title Bar */}
      <div 
        onClick={toggleTerminalExpanded}
        className="flex items-center justify-between px-5 h-12 bg-black/40 border-b border-neon-green/5 cursor-pointer hover:bg-black/60 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-neon-green animate-pulse" />
          <span className="text-[10px] text-neon-green/80 font-bold uppercase tracking-widest">
            operator@secured-node:~$ <span className="text-neutral-500 font-normal">({terminalHistory.length} events logged)</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[9px] text-neutral-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green/40 animate-ping" />
            <span>Type &apos;help&apos; to start</span>
          </div>
          <button className="text-neon-green/60 hover:text-neon-green transition-colors cursor-pointer">
            {isTerminalExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Expanded Output Screen */}
      {isTerminalExpanded && (
        <div className="flex flex-col h-[calc(100%-48px)] p-4">
          {/* Scrollable logs area */}
          <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl border border-neon-green/5 p-4 space-y-2 mb-3 scrollbar-thin text-xs">
            {terminalHistory.map((item, index) => (
              <div key={index} className="space-y-1 select-text">
                <div className="flex items-center justify-between text-[9px] text-neutral-600">
                  <span>[{item.timestamp}]</span>
                  <span>NODE: 0x01_EXEC</span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-neon-green/45 mr-2">&gt;</span>
                  <span 
                    className={`whitespace-pre-wrap ${
                      item.type === "input" 
                        ? "text-white font-semibold" 
                        : item.type === "error"
                          ? "text-red-400 font-bold"
                          : item.type === "success"
                            ? "text-neon-green font-bold neon-text-glow-dim"
                            : "text-neutral-400"
                    }`}
                  >
                    {item.output}
                  </span>
                </div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="flex items-center bg-black border border-neon-green/10 rounded-xl px-4 py-2">
            <span className="text-xs text-neon-green/55 mr-2">operator@secured:~$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="type 'help' or inject 'hack'..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-neon-green font-mono placeholder-neutral-700 w-full"
              autoFocus
            />
            <button 
              type="submit"
              className="text-neon-green/50 hover:text-neon-green transition-colors cursor-pointer"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
