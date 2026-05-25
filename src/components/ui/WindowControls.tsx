"use client";

import React from "react";

interface WindowControlsProps {
  title?: string;
  onClose?: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ title, onClose }) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-black/40 border-b border-neon-green/10 rounded-t-2xl">
      {/* Red, Yellow, Green Window Dots */}
      <div className="flex items-center space-x-2 group">
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Close"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-red-950 absolute -top-[1px]">×</span>
        </button>
        <button
          className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          title="Minimize"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-yellow-950 absolute -top-[1.5px]">-</span>
        </button>
        <button
          className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          title="Maximize"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[5px] font-bold text-green-950 absolute -top-[1px]">+</span>
        </button>
      </div>

      {/* Terminal Title */}
      {title && (
        <span className="text-xs font-mono text-neon-green/50 tracking-wider select-none">
          {title}
        </span>
      )}

      {/* Connection Glow */}
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green neon-bg-glow animate-pulse" />
        <span className="text-[10px] font-mono text-neon-green/45 uppercase tracking-widest hidden sm:inline">
          SECURE_NODE_01
        </span>
      </div>
    </div>
  );
};
