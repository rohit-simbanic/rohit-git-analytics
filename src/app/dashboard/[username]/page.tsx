"use client";

import React, { useEffect, use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { ProfileOverview } from "@/components/dashboard/ProfileOverview";
import { ActivitySummary } from "@/components/dashboard/ActivitySummary";
import { RepoTable } from "@/components/dashboard/RepoTable";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { InteractiveTerminal } from "@/components/dashboard/InteractiveTerminal";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Cpu, Terminal, AlertTriangle, ShieldAlert, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function DynamicDashboardPage({ params }: PageProps) {
  const { username } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { fetchUserProfile, fetchStatus, fetchError } = useDashboardStore();
  const [bootProgress, setBootProgress] = useState(0);

  // Parse clean handles
  const displayHandle = username.startsWith("@") ? username : `@${username}`;

  // Fetch live stats on mount or route handle changes with access checks for guests
  useEffect(() => {
    if (!username) return;

    let isCancelled = false;

    async function checkAccessAndFetch() {
      // Wait until NextAuth session state resolves
      if (status === "loading") return;

      const cleanUser = username.replace(/^@/, "").toLowerCase();

      if (status === "unauthenticated") {
        try {
          const res = await fetch("/api/showcase-config");
          if (isCancelled) return;

          let allowedUser = "steipete";
          if (res.ok) {
            const config = await res.json();
            allowedUser = config.allowPublicShowcase && config.defaultUser
              ? config.defaultUser.replace(/^@/, "").toLowerCase()
              : "steipete";
          }

          if (cleanUser !== allowedUser) {
            router.push("/login");
            return;
          }
        } catch (e) {
          // If showcase API check fails, default to allowing only "steipete"
          if (cleanUser !== "steipete") {
            router.push("/login");
            return;
          }
        }
      }

      // If authorized, fetch the user profile stats
      fetchUserProfile(username);
    }

    checkAccessAndFetch();

    return () => {
      isCancelled = true;
    };
  }, [username, status, router, fetchUserProfile]);

  // Boot sequence loading simulation
  useEffect(() => {
    if (fetchStatus === "loading") {
      setBootProgress(0);
      const interval = setInterval(() => {
        setBootProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 12;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [fetchStatus]);

  // Session banner check: is the loaded page the logged in user?
  const isOwner = session?.user?.name?.toLowerCase() === displayHandle.toLowerCase();

  // 1. Loading View
  if (fetchStatus === "loading" || bootProgress < 100) {
    return (
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#050505] overflow-hidden font-mono p-4">
        <div className="absolute inset-0 cyber-scanlines opacity-5 pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-sm w-full">
          <div className="p-3.5 rounded-full bg-neon-green/5 border border-neon-green/20 mb-4 animate-pulse-slow">
            <Cpu className="w-7 h-7 text-neon-green animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          
          <h2 className="text-sm font-bold text-neon-green uppercase tracking-[0.25em] mb-2 neon-text-glow">
            RESOLVING_NODE_{username.toUpperCase()}
          </h2>
          
          <div className="w-full bg-black/60 border border-neon-green/10 h-3 rounded overflow-hidden relative mb-2">
            <div 
              className="bg-neon-green h-full shadow-[0_0_8px_rgba(163,255,18,0.7)] transition-all duration-150"
              style={{ width: `${Math.min(100, bootProgress)}%` }}
            />
          </div>
          
          <span className="text-[8px] text-neutral-500 uppercase tracking-widest text-center">
            PARSING CRYPTOGRAPHIC PROFILE INDICES... {Math.min(100, bootProgress)}%
          </span>
        </div>
      </main>
    );
  }

  // 2. Error View (Node not found)
  if (fetchStatus === "error") {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center bg-[#050505] overflow-hidden font-mono p-4">
        <div className="absolute inset-0 cyber-scanlines opacity-5 pointer-events-none" />
        <div className="absolute inset-0 cyber-grid-dense opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <GlassCard
            title="NODE_RESOLUTION_EXCEPTION // 0x404"
            showWindowControls={true}
            className="border-red-500/20"
          >
            <div className="flex flex-col items-center text-center p-2">
              <div className="p-3 rounded-full bg-red-950/20 border border-red-500/30 text-red-400 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <ShieldAlert className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
                Node Resolution Interrupted
              </h2>
              <p className="text-[10px] text-neutral-400 leading-relaxed mb-6">
                The terminal could not resolve the profile <span className="text-red-400 font-bold">@{username}</span> on GitHub. 
                Verify spelling, search syntax, or check if the repository owner registry is public.
              </p>
              
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => router.push("/dashboard/steipete")}
                  className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Load Showcase Node (steipete)
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    );
  }

  // 3. Success View (Render Dashboard)
  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-[#eceff4] overflow-x-hidden pb-16">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black pointer-events-none" />

      {/* macOS Header Title Controls */}
      <Header />

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Connection status banner (Dynamic Owner vs Guest banner) */}
        {isOwner ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neon-green/5 border border-neon-green/10 rounded-xl px-4 py-3 font-mono text-[10px] text-neon-green/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-neon-green" />
              <span>CONNECTED TO LIVE AUTHORIZED NODE // OWNER SESSION ACTIVE & COMPLIANT.</span>
            </div>
            <div className="text-neutral-500 uppercase font-semibold">
              SECURE OWNER ACCESS
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-sky-500/5 border border-sky-500/10 rounded-xl px-4 py-3 font-mono text-[10px] text-sky-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>PUBLIC PROFILE PREVIEW // VIEWING NODE OVERVIEW FOR {displayHandle.toUpperCase()}.</span>
            </div>
            <button 
              onClick={() => router.push("/login")}
              className="text-[9px] bg-sky-950/20 hover:bg-sky-950/50 border border-sky-500/20 rounded px-2 py-0.5 uppercase transition-colors cursor-pointer"
            >
              Sign In to View Yours
            </button>
          </div>
        )}

        {/* Profile statistics gauge */}
        <ProfileOverview isOwner={isOwner} />

        {/* AI "WORKING ON" description */}
        <ActivitySummary />

        {/* Commit frequency & language graphs */}
        <AnalyticsSection />

        {/* Dynamic repository filter grid index */}
        <RepoTable />

      </div>

      {/* Bottom collapsible command CLI */}
      <InteractiveTerminal />
    </main>
  );
}
