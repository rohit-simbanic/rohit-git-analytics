"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Terminal, BarChart2, PieChart as PieIcon, Activity } from "lucide-react";

export const AnalyticsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { repos, profile } = useDashboardStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center font-mono text-neutral-600 text-xs">
        LOADING ANALYTICS ENGINE...
      </div>
    );
  }

  // Generate mock grid calendar: 18 columns, 7 rows (representing recent 18 weeks of activity)
  const generateContributionData = () => {
    const list = [];
    const colors = [
      "bg-neutral-900/40 border border-neutral-900/60", // 0 commits
      "bg-neon-green/[0.08] border border-neon-green/5 shadow-[0_0_2px_rgba(163,255,18,0.05)]", // low
      "bg-neon-green/[0.25] border border-neon-green/10 shadow-[0_0_4px_rgba(163,255,18,0.1)]", // medium
      "bg-neon-green/[0.5] border border-neon-green/15 shadow-[0_0_8px_rgba(163,255,18,0.2)]", // high
      "bg-neon-green border border-neon-green/20 shadow-[0_0_12px_rgba(163,255,18,0.4)]", // intense
    ];

    for (let c = 0; c < 30; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        // Randomize weight
        const rand = Math.random();
        let level = 0;
        if (rand > 0.85) level = 4;
        else if (rand > 0.6) level = 3;
        else if (rand > 0.4) level = 2;
        else if (rand > 0.15) level = 1;
        
        col.push({
          commits: level === 0 ? 0 : Math.floor(Math.random() * (level * 3)) + 1,
          colorClass: colors[level],
        });
      }
      list.push(col);
    }
    return list;
  };

  const contributionGrid = generateContributionData();

  // Compute languages distribution dynamically from repos!
  const getLanguagesData = () => {
    if (!repos || repos.length === 0) {
      return [
        { name: "Swift", value: 38, color: "#F05138" },
        { name: "TypeScript", value: 28, color: "#3178C6" },
        { name: "Go", value: 18, color: "#00ADD8" },
        { name: "Rust", value: 16, color: "#DEA584" },
      ];
    }
    
    const countMap: Record<string, number> = {};
    let total = 0;
    
    repos.forEach((repo) => {
      const lang = repo.tags[0] || "Other";
      countMap[lang] = (countMap[lang] || 0) + 1;
      total++;
    });
    
    const colorMap: Record<string, string> = {
      swift: "#F05138",
      typescript: "#3178C6",
      go: "#00ADD8",
      rust: "#DEA584",
      javascript: "#F7DF1E",
      python: "#3776AB",
      html: "#E34F26",
      css: "#1572B6",
    };
    
    const result = Object.entries(countMap).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      const nameLower = name.toLowerCase();
      const color = colorMap[nameLower] || `hsl(${(name.charCodeAt(0) * 15) % 360}, 70%, 55%)`;
      return {
        name,
        value: pct,
        color,
      };
    });
    
    result.sort((a, b) => b.value - a.value);
    return result.slice(0, 4);
  };

  const languagesData = getLanguagesData();

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 select-none">
      
      {/* 1. Contribution Grid Panel */}
      <div className="xl:col-span-2 bg-[#0a0a0a]/60 border border-neon-green/10 rounded-2xl p-5 relative flex flex-col justify-between">
        <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between border-b border-neon-green/10 pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-neon-green animate-pulse" />
              <span className="text-[10px] text-neon-green uppercase font-bold tracking-wider">
                CONTRIBUTION_MATRIX // 210_EPOCHS
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500 uppercase">SYS: ACTIVE</span>
          </div>

          {/* Grid render */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex gap-[3px] min-w-[500px]">
              {contributionGrid.map((col, cIndex) => (
                <div key={cIndex} className="flex flex-col gap-[3px]">
                  {col.map((cell, rIndex) => (
                    <div
                      key={rIndex}
                      className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-125 duration-100 cursor-pointer ${cell.colorClass}`}
                      title={`${cell.commits} commits on node_${cIndex}_${rIndex}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 font-mono text-[9px] text-neutral-500 uppercase pt-2 border-t border-neon-green/5">
          <span>// Calendar activity footprint</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-[1px] bg-neutral-900" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-neon-green/10" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-neon-green/30" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-neon-green/60" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-neon-green" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* 2. Language Distribution (Pie Chart) */}
      <div className="bg-[#0a0a0a]/60 border border-neon-green/10 rounded-2xl p-5 relative flex flex-col justify-between">
        <div className="absolute inset-0 cyber-grid-dense opacity-5 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between border-b border-neon-green/10 pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono">
              <PieIcon className="w-4 h-4 text-neon-green" />
              <span className="text-[10px] text-neon-green uppercase font-bold tracking-wider">
                COMPILER_DISTRIBUTION
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">// PIE.SYS</span>
          </div>

          {/* Chart Wrapper */}
          <div className="w-full h-32 flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languagesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {languagesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#050505"
                      strokeWidth={2}
                      style={{
                        filter: `drop-shadow(0 0 3px ${entry.color}44)`
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: "rgba(5, 5, 5, 0.9)",
                    border: "1px solid rgba(163, 255, 18, 0.2)",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: "10px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Labels and values side column */}
            <div className="flex flex-col gap-1.5 font-mono text-[9px] text-neutral-400 pl-4 w-32 border-l border-neon-green/5">
              {languagesData.map((lang) => (
                <div key={lang.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                    <span className="truncate">{lang.name}</span>
                  </div>
                  <span className="text-white font-semibold">{lang.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[8px] font-mono text-neutral-500 uppercase mt-4 pt-2 border-t border-neon-green/5">
          // Primary code translation targets
        </div>
      </div>

      {/* 3. Commit Activity Area Chart */}
      <div className="xl:col-span-3 bg-[#0a0a0a]/60 border border-neon-green/10 rounded-2xl p-5 relative">
        <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />

        <div className="flex items-center justify-between border-b border-neon-green/10 pb-3 mb-4">
          <div className="flex items-center gap-2 font-mono">
            <BarChart2 className="w-4 h-4 text-neon-green" />
            <span className="text-[10px] text-neon-green uppercase font-bold tracking-wider">
              WEEKLY_GIT_FLUX_CALCULUS
            </span>
          </div>
          <span className="text-[9px] font-mono text-neutral-500 uppercase">// TIME_SERIES_07D</span>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-44 font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={profile.commitActivity && profile.commitActivity.length > 0 ? profile.commitActivity : [
                { day: "Mon", commits: 0 },
                { day: "Tue", commits: 0 },
                { day: "Wed", commits: 0 },
                { day: "Thu", commits: 0 },
                { day: "Fri", commits: 0 },
                { day: "Sat", commits: 0 },
                { day: "Sun", commits: 0 },
              ]}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="neonGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3FF12" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#A3FF12" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                tickLine={false} 
                axisLine={false}
                style={{ fontSize: "9px" }}
              />
              <YAxis 
                stroke="#666" 
                tickLine={false} 
                axisLine={false}
                style={{ fontSize: "9px" }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(5, 5, 5, 0.95)",
                  border: "1px solid rgba(163, 255, 18, 0.2)",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}
              />
              {/* Additions Curve */}
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#A3FF12"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#neonGreenGrad)"
                name="Commits Pushed"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(163, 255, 18, 0.3))"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer indicators */}
        <div className="flex items-center justify-between mt-3 font-mono text-[9px] text-neutral-500 uppercase pt-2 border-t border-neon-green/5">
          <span>// Git push event volume frequency</span>
          <span>AVERAGE_DENSITY: 24.2 / DAY</span>
        </div>
      </div>
      
    </div>
  );
};
