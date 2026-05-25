"use client";

import React, { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { GitCommit, GitPullRequest, AlertCircle, MessageSquare } from "lucide-react";

type Timeframe = "day" | "week" | "month";

export const ActivitySummary: React.FC = () => {
  const { profile } = useDashboardStore();
  const [timeframe, setTimeframe] = useState<Timeframe>("week");

  // Dynamic content based on timeframe
  const getContent = () => {
    switch (timeframe) {
      case "day":
        return {
          text: "Today focused heavily on local sandbox trials in openclaw/crabbox, resolving WASM virtualization faults. Commits were pushed to resolve clawsweeper Docker caching layers. Initiated security audit handshake inside steipete/oracle to check endpoint vulnerability indices. Cleaned up dev environment configurations.",
          stats: { commits: 24, prs: 3, issues: 1, comments: 8 },
          contributions: [
            { name: "openclaw/crabbox", count: 12 },
            { name: "openclaw/clawsweeper", count: 8 },
            { name: "steipete/oracle", count: 4 },
          ],
          footer: "28 public events · 3 active repos · updated 5 mins ago",
        };
      case "month":
        return {
          text: "Over the past month, we completed a massive engineering sprint cycle across all primary packages. openclaw core was refactored for async scheduler pipelines, deploying v1.2.0 production-ready release. Decommissioned three legacy components. Integrated multi-model token parsers in CodexBar. Re-architected clawsweeper's Docker layers, reducing memory waste by 38%. Resolved 18 outstanding issues and published multiple docs updates.",
          stats: { commits: 680, prs: 142, issues: 76, comments: 245 },
          contributions: [
            { name: "openclaw/openclaw", count: 450 },
            { name: "steipete/CodexBar", count: 98 },
            { name: "openclaw/clawsweeper", count: 72 },
            { name: "openclaw/crabbox", count: 40 },
            { name: "steipete/IndexBar", count: 20 },
          ],
          footer: "1,248 public events · 12 repos · updated today",
        };
      case "week":
      default:
        return {
          text: profile.workingSummary,
          stats: profile.stats,
          contributions: profile.repoContributions,
          footer: "296 public events · 7 repos · updated today",
        };
    }
  };

  const current = getContent();

  return (
    <div className="w-full bg-[#0a0a0a]/60 border border-neon-green/10 rounded-2xl p-5 relative select-none">
      {/* Grid Pattern */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />

      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-neon-green/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neon-green bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            WORKING IN
          </span>
        </div>

        {/* Time selector buttons */}
        <div className="flex items-center bg-black/60 border border-neon-green/10 rounded-lg p-0.5 font-mono text-[9px]">
          {(["day", "week", "month"] as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-neon-green text-black font-bold shadow-[0_0_8px_rgba(163,255,18,0.2)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary block text */}
      <div className="font-mono text-xs text-neutral-300 leading-relaxed text-justify mb-5 p-4 bg-black/35 rounded-xl border border-neon-green/5 min-h-[100px] selection:bg-neon-green/20 selection:text-neon-green">
        {current.text}
      </div>

      {/* Numeric stats and contribution capsules row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-neon-green/5 pt-4">
        {/* Core Stats badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Commits */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-neon-green/10 rounded-lg font-mono text-[10px]">
            <GitCommit className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-white font-bold">{current.stats.commits}</span>
            <span className="text-neutral-500 lowercase">commits</span>
          </div>
          {/* PRs */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-neon-green/10 rounded-lg font-mono text-[10px]">
            <GitPullRequest className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-white font-bold">{current.stats.prs}</span>
            <span className="text-neutral-500 lowercase">PRs</span>
          </div>
          {/* Issues */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-neon-green/10 rounded-lg font-mono text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
            <span className="text-white font-bold">{current.stats.issues}</span>
            <span className="text-neutral-500 lowercase">issues</span>
          </div>
          {/* Comments */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-neon-green/10 rounded-lg font-mono text-[10px]">
            <MessageSquare className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span className="text-white font-bold">{current.stats.comments}</span>
            <span className="text-neutral-500 lowercase">comments</span>
          </div>
        </div>

        {/* Repository contribution pills */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-full overflow-hidden">
          {current.contributions.map((repo) => (
            <div
              key={repo.name}
              className="flex items-center px-2 py-1 bg-neon-green/5 border border-neon-green/20 hover:border-neon-green/40 transition-colors rounded-lg font-mono text-[9px] text-neon-green/80"
            >
              <span className="truncate max-w-[100px] sm:max-w-[150px]">{repo.name}</span>
              <span className="w-px h-2 bg-neon-green/30 mx-1.5" />
              <span className="text-white font-semibold">{repo.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info line */}
      <div className="w-full flex items-center justify-start mt-3 font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
        <span>// {current.footer}</span>
      </div>
    </div>
  );
};
