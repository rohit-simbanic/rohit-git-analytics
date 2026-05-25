"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCw, Shield, LogOut, LogIn, Terminal, ExternalLink } from "lucide-react";
import Image from "next/image";

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userName = session?.user?.name || "@steipete";
  const userAvatar = session?.user?.image || "https://avatars.githubusercontent.com/u/10496?v=4"; // steipete github image

  return (
    <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neon-green/10 px-4 py-2.5 flex items-center justify-between select-none">
      
      {/* Left Action Elements: Window Controls & Simple Nav */}
      <div className="flex items-center space-x-4">
        {/* macOS Window Controls */}
        <div className="flex items-center space-x-1.5 group">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] relative flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-red-950 absolute -top-[1.5px]">×</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] relative flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-yellow-950 absolute -top-[2px]">-</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] relative flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-[5px] font-bold text-green-950 absolute -top-[1.5px]">+</span>
          </div>
        </div>

        {/* Browser Navigation Controls */}
        <div className="flex items-center space-x-1 hidden md:flex">
          <button className="p-1 rounded hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-1 rounded hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Address Bar (Glassmorphic) */}
      <div className="flex-1 max-w-md mx-4">
        <div className="bg-black/50 border border-neon-green/10 rounded-lg px-3 py-1 flex items-center justify-between text-xs font-mono text-neon-green/60 shadow-inner">
          <div className="flex items-center gap-1.5 truncate">
            <Shield className="w-3 h-3 text-neon-green/40 animate-pulse" />
            <span className="text-neon-green/30 text-[10px]">https://</span>
            <span className="text-neon-green/80 font-semibold truncate">developer.terminal</span>
            <span className="text-neon-green/30">/dashboard</span>
          </div>
          <ExternalLink className="w-3 h-3 text-neon-green/30 hidden sm:inline" />
        </div>
      </div>

      {/* Right User Session Panel */}
      <div className="flex items-center space-x-3.5">
        {/* Connection Pulse */}
        <div className="items-center space-x-1.5 hidden lg:flex font-mono text-[9px] text-neon-green/40">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green neon-bg-glow animate-ping" />
          <span>GATE_STABLE</span>
        </div>

        {/* User Card Badge or Sign In button */}
        {status === "authenticated" ? (
          <div className="flex items-center gap-2 bg-black/40 border border-neon-green/10 hover:border-neon-green/30 rounded-xl px-2.5 py-1.5 transition-colors">
            <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-neon-green/20">
              <Image 
                src={userAvatar} 
                alt="Hacker Avatar" 
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-mono text-xs font-semibold text-neon-green/80 hidden sm:inline">
              {userName}
            </span>
            <div className="w-px h-3.5 bg-neon-green/20 mx-1 hidden sm:inline" />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1 text-neon-green/50 hover:text-neon-green transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/10 border border-neon-green/35 hover:border-neon-green text-xs font-mono text-neon-green rounded-xl transition-all cursor-pointer font-bold active:scale-[0.98] hover:shadow-[0_0_12px_rgba(163,255,18,0.15)] bg-black/40"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
      
    </div>
  );
};
