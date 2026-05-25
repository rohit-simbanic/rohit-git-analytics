"use client";

import React from "react";
import { WindowControls } from "./WindowControls";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showWindowControls?: boolean;
  hasScanlines?: boolean;
  hasDenseGrid?: boolean;
  onClose?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  title,
  showWindowControls = false,
  hasScanlines = false,
  hasDenseGrid = false,
  onClose,
}) => {
  return (
    <div
      className={`relative flex flex-col w-full bg-card-bg/60 backdrop-blur-md rounded-2xl border border-neon-green/10 shadow-2xl hover:shadow-[0_0_30px_rgba(163,255,12,0.05)] transition-all duration-500 overflow-hidden ${className}`}
    >
      {/* Background Subtle Grid Texture */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 ${hasDenseGrid ? "cyber-grid-dense" : "cyber-grid"}`} />

      {/* Cyberpunk Scanlines */}
      {hasScanlines && (
        <div className="absolute inset-0 pointer-events-none opacity-5 cyber-scanlines z-10" />
      )}

      {/* Window Controls Header */}
      {showWindowControls && (
        <WindowControls title={title} onClose={onClose} />
      )}

      {/* Header for Title if WindowControls are hidden */}
      {!showWindowControls && title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-neon-green/10 bg-black/25">
          <h3 className="text-xs font-mono text-neon-green/70 tracking-widest uppercase font-semibold">
            {title}
          </h3>
          <span className="text-[10px] font-mono text-neon-green/30 select-none">{"// SYS.LOG"}</span>
        </div>
      )}

      {/* Card Content Container */}
      <div className="relative flex-1 p-5 z-20">
        {children}
      </div>

      {/* Bottom Corner Accent Accents */}
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-neon-green/20 rounded-br-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-neon-green/20 rounded-bl-2xl pointer-events-none" />
    </div>
  );
};
