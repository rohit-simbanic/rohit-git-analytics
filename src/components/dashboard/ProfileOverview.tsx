"use client";

import React, { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Calendar, Users, GitFork, Info, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ProfileOverviewProps {
  isOwner?: boolean;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ isOwner = false }) => {
  const { profile } = useDashboardStore();
  const [showFactors, setShowFactors] = useState(false);
  const [isShowcaseActive, setIsShowcaseActive] = useState(false);
  const [isTogglingShowcase, setIsTogglingShowcase] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetch("/api/showcase-config")
        .then((res) => res.json())
        .then((data) => {
          const cleanHandle = profile.handle.replace(/^@/, "");
          if (data.defaultUser.toLowerCase() === cleanHandle.toLowerCase()) {
            setIsShowcaseActive(!!data.allowPublicShowcase);
          }
        })
        .catch((e) => console.error("Error fetching config:", e));
    }
  }, [isOwner, profile.handle]);

  const handleToggleShowcase = async () => {
    setIsTogglingShowcase(true);
    const cleanHandle = profile.handle.replace(/^@/, "");
    const newStatus = !isShowcaseActive;
    
    try {
      const res = await fetch("/api/showcase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultUser: cleanHandle,
          allowPublicShowcase: newStatus,
        }),
      });
      
      if (res.ok) {
        setIsShowcaseActive(newStatus);
        const termCmd = newStatus ? "showcase-enable" : "showcase-disable";
        const termMsg = newStatus 
          ? `SUCCESS: Profile @${cleanHandle} set as default showcase landing page.`
          : `SUCCESS: Showcase disabled. Default landing profile reset to @steipete.`;
        
        useDashboardStore.getState().addTerminalCommand(termCmd, termMsg, "success");
      }
    } catch (e) {
      console.error("Error toggling showcase status:", e);
    } finally {
      setIsTogglingShowcase(false);
    }
  };

  // SVG Circular Gauge calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (profile.trustScore / 100) * circumference;

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch gap-4 select-none">
      
      {/* Profile Avatar Card */}
      <div className="flex-1 md:flex-initial md:w-80 bg-card-bg/60 border border-neon-green/10 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 to-transparent pointer-events-none" />
        
        {/* Animated Corner Marks */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon-green/20 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neon-green/20 rounded-tr-xl" />

        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-neon-green/30 group-hover:border-neon-green transition-colors duration-500 shadow-[0_0_15px_rgba(163,255,18,0.1)]">
          <Image
            src={profile.avatarUrl}
            alt="Developer Avatar"
            fill
            priority
            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
        </div>
        
        <h2 className="text-2xl font-mono font-bold text-white mt-4 tracking-wide group-hover:text-neon-green transition-colors">
          {profile.handle}
        </h2>
        <p className="text-[10px] font-mono text-neon-green/60 uppercase tracking-widest mt-1">
          Release Freshness Monitor
        </p>
      </div>

      {/* Main Stats Grid Container */}
      <div className="flex-1 bg-card-bg/60 border border-neon-green/10 rounded-2xl p-5 flex flex-col justify-between relative">
        <div className="absolute inset-0 cyber-grid-dense opacity-5 pointer-events-none" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          {/* Trust Score circular gauge */}
          <div className="bg-black/40 border border-neon-green/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-1.5 left-2 text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
              TRUST SCORE
            </div>
            
            <div className="relative flex items-center justify-center w-16 h-16 mt-2">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-neutral-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                {/* Glowing Progress */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-neon-green transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(163, 255, 18, 0.6))"
                  }}
                />
              </svg>
              {/* Score text */}
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-mono font-bold text-white leading-none">
                  {profile.trustScore}
                </span>
                <span className="text-[7px] font-mono text-neon-green font-bold tracking-tighter mt-0.5 px-1 bg-neon-green/10 border border-neon-green/20 rounded">
                  {profile.trustRating}
                </span>
              </div>
            </div>
          </div>

          {/* GitHub Age */}
          <div className="bg-black/40 border border-neon-green/5 rounded-xl p-4 flex flex-col justify-between relative group hover:border-neon-green/20 transition-colors">
            <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
              GITHUB AGE
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Calendar className="w-4 h-4 text-neon-green/70 group-hover:scale-110 transition-transform" />
              <div className="font-mono text-xs font-semibold text-white/90">
                {profile.githubAge}
              </div>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 mt-2">
              Verified account epoch {profile.githubAgeEpoch || "N/A"}
            </div>
          </div>

          {/* Followers Reach */}
          <div className="bg-black/40 border border-neon-green/5 rounded-xl p-4 flex flex-col justify-between relative group hover:border-neon-green/20 transition-colors">
            <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
              REACH
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Users className="w-4 h-4 text-neon-green/70 group-hover:scale-110 transition-transform" />
              <div className="font-mono text-xs font-semibold text-white/90">
                {profile.followers}
              </div>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 mt-2">
              Developer network footprint
            </div>
          </div>

          {/* Builder active repos */}
          <div className="bg-black/40 border border-neon-green/5 rounded-xl p-4 flex flex-col justify-between relative group hover:border-neon-green/20 transition-colors">
            <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
              BUILDER
            </div>
            <div className="flex items-center gap-2 mt-4">
              <GitFork className="w-4 h-4 text-neon-green/70 group-hover:scale-110 transition-transform" />
              <div className="font-mono text-xs font-semibold text-white/90">
                {profile.activeRepos} Active Repos
              </div>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 mt-2">
              Primary production repositories
            </div>
          </div>

        </div>

        {/* Bottom Panel Actions & Indicators */}
        <div className="flex items-center justify-between border-t border-neon-green/5 pt-4 mt-4 w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-[9px] font-mono text-neutral-500 uppercase">SYS_ACTIVE</span>
            </div>
            {isOwner && profile.handle.replace(/^@/, "").toLowerCase() === "rohit-simbanic" && (
              <button
                onClick={handleToggleShowcase}
                disabled={isTogglingShowcase}
                className={`flex items-center gap-1.5 px-2.5 py-1 bg-black border text-[9px] font-mono uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                  isShowcaseActive 
                    ? "border-neon-green text-neon-green shadow-[0_0_8px_rgba(163,255,18,0.2)] bg-neon-green/5" 
                    : "border-neutral-800 text-neutral-500 hover:border-neutral-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isShowcaseActive ? "bg-neon-green animate-pulse" : "bg-neutral-600"}`} />
                {isShowcaseActive ? "showcase: active" : "set as showcase"}
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFactors(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-black border border-neon-green/20 hover:border-neon-green text-[10px] font-mono text-neon-green uppercase rounded-lg transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            factors
          </button>
        </div>
      </div>

      {/* Factors Detailed Modal */}
      {showFactors && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neon-green/30 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden p-6 font-mono">
            {/* Modal grid decoration */}
            <div className="absolute inset-0 cyber-grid-dense opacity-5 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-neon-green/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                <span className="text-xs uppercase font-bold tracking-widest text-neon-green">
                  Trust Index Factors
                </span>
              </div>
              <button 
                onClick={() => setShowFactors(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Factor breakdown details */}
            <div className="space-y-4 text-[11px] text-neutral-400">
              <p className="text-[10px] text-neutral-500 uppercase mb-2">
                Cryptographic breakdown of security & active production weights:
              </p>

              {/* Factor 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-white text-xs">
                  <span>1. CI Pipeline Health</span>
                  <span className="text-neon-green font-semibold">+25%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full w-[95%]" />
                </div>
                <p className="text-[9px] text-neutral-500">95% automated test coverage pass rate on main branches.</p>
              </div>

              {/* Factor 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-white text-xs">
                  <span>2. Release Cadence Frequency</span>
                  <span className="text-neon-green font-semibold">+20%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full w-[90%]" />
                </div>
                <p className="text-[9px] text-neutral-500">Weekly releases maintained across primary repositories.</p>
              </div>

              {/* Factor 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-white text-xs">
                  <span>3. Commit Density Weight</span>
                  <span className="text-neon-green font-semibold">+20%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full w-[85%]" />
                </div>
                <p className="text-[9px] text-neutral-500">170 commits in the current tracking period.</p>
              </div>

              {/* Factor 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-white text-xs">
                  <span>4. Open PR Resolution Ratio</span>
                  <span className="text-neon-green font-semibold">+15%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full w-[80%]" />
                </div>
                <p className="text-[9px] text-neutral-500">83% of incoming PRs merged within 24 hours.</p>
              </div>

              {/* Factor 5 */}
              <div className="space-y-1">
                <div className="flex justify-between text-white text-xs">
                  <span>5. Issue Resolution Lifecycle</span>
                  <span className="text-neon-green font-semibold">+11%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full w-[70%]" />
                </div>
                <p className="text-[9px] text-neutral-500">Average issue resolution lifecycle stands at 32 hours.</p>
              </div>

            </div>

            {/* Total Cryptographic Footer */}
            <div className="border-t border-neon-green/10 pt-4 mt-5 flex items-center justify-between text-xs">
              <span className="text-neutral-500 uppercase">CALCULATED SCORE:</span>
              <span className="text-neon-green font-bold text-sm neon-text-glow">
                {profile.trustScore} / 100
              </span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
