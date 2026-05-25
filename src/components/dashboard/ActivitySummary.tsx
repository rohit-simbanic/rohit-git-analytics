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
    const handleClean = profile.handle || "@steipete";
    const repoNames = profile.repoContributions.slice(0, 3).map(r => r.name.split("/")[1] || r.name);
    
    switch (timeframe) {
      case "day": {
        const dayCommits = Math.max(1, Math.floor(profile.stats.commits / 7));
        const dayPRs = Math.max(0, Math.floor(profile.stats.prs / 7));
        const dayIssues = Math.max(0, Math.floor(profile.stats.issues / 7));
        const dayComments = Math.max(0, Math.floor(profile.stats.comments / 7));
        const dayContributions = profile.repoContributions.slice(0, 3).map(c => ({
          name: c.name,
          count: Math.max(1, Math.floor(c.count / 7))
        }));

        return {
          text: `Today, ${handleClean} focused heavily on active development and resolving local faults. Commits were pushed to repositories like ${repoNames.slice(0, 2).join(" and ") || "projects"}. Work involved refactoring dependency layers, committing code updates, and reviewing open pull requests.`,
          stats: { commits: dayCommits, prs: dayPRs, issues: dayIssues, comments: dayComments },
          contributions: dayContributions,
          footer: `${Math.max(5, Math.floor((profile.stats.commits + profile.stats.prs) * 0.2))} public events · ${profile.activeRepos} active repos · updated 5 mins ago`,
        };
      }
      case "month": {
        const monthCommits = profile.stats.commits * 4;
        const monthPRs = profile.stats.prs * 4;
        const monthIssues = profile.stats.issues * 4;
        const monthComments = profile.stats.comments * 4;
        const monthContributions = profile.repoContributions.map(c => ({
          name: c.name,
          count: c.count * 4
        }));

        return {
          text: `Over the past month, ${handleClean} completed a massive engineering sprint cycle across all primary packages. Code integrations and refactoring advanced in parallel for repositories including ${repoNames.join(", ") || "repositories"}. Major achievements involved pushing ${monthCommits} commits, resolving pull requests, auditing security indices, and closing outstanding issues.`,
          stats: { commits: monthCommits, prs: monthPRs, issues: monthIssues, comments: monthComments },
          contributions: monthContributions,
          footer: `${(profile.stats.commits + profile.stats.prs) * 5} public events · ${profile.activeRepos} repos · updated today`,
        };
      }
      case "week":
      default:
        return {
          text: profile.workingSummary,
          stats: profile.stats,
          contributions: profile.repoContributions,
          footer: `${(profile.stats.commits + profile.stats.prs) * 1.5} public events · ${profile.activeRepos} repos · updated today`,
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
