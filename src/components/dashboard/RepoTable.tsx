"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Play, CheckCircle2, XCircle, RefreshCw, LayoutGrid, FolderCode } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SourceExplorer } from "@/components/dashboard/SourceExplorer";

export const RepoTable: React.FC = () => {
  const router = useRouter();
  const { 
    repos,
    profile,
    searchQuery, 
    setSearchQuery, 
    activeFilter, 
    setActiveFilter, 
    triggerCIRecheck,
    addTerminalCommand 
  } = useDashboardStore();

  // Parse clean owner handle (strip leading '@')
  const ownerHandle = profile.handle.replace(/^@/, "").toLowerCase();

  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [recheckingRepo, setRecheckingRepo] = useState<string | null>(null);
  // Track active panel tab per repo: 'metrics' | 'explorer'
  const [repoTab, setRepoTab] = useState<Record<string, "metrics" | "explorer">>({});
  const recheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (recheckTimeoutRef.current) {
        clearTimeout(recheckTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.startsWith("@")) {
      const handle = query.replace(/^@/, "");
      if (handle) router.push(`/dashboard/${handle}`);
    } else {
      // Check if it matches any local repos in the list.
      const hasLocalMatch = repos.some(
        (r) => 
          r.name.toLowerCase().includes(query.toLowerCase()) || 
          r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      );
      // If not, perform a global GitHub profile lookup!
      if (!hasLocalMatch) {
        router.push(`/dashboard/${query}`);
      }
    }
  };

  const handleRecheck = (e: React.MouseEvent, repoName: string) => {
    e.stopPropagation();
    setRecheckingRepo(repoName);
    addTerminalCommand(`ci-trigger --run ${repoName}`, `Initiating CI/CD build check for ${repoName}...`, "input");
    
    recheckTimeoutRef.current = setTimeout(() => {
      triggerCIRecheck(repoName);
      setRecheckingRepo(null);
      addTerminalCommand(`ci-success`, `All checks passed for ${repoName}. System reports status SUCCESS.`, "success");
      recheckTimeoutRef.current = null;
    }, 1500);
  };

  const toggleRow = (repoName: string) => {
    setExpandedRepo(expandedRepo === repoName ? null : repoName);
    // Default to metrics tab on first expand
    if (!repoTab[repoName]) {
      setRepoTab((prev) => ({ ...prev, [repoName]: "metrics" }));
    }
  };

  const setTab = (repoName: string, tab: "metrics" | "explorer") => {
    setRepoTab((prev) => ({ ...prev, [repoName]: tab }));
  };

  // Filter & Search logic
  const filteredRepos = repos.filter((repo) => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "need attention") return matchesSearch && repo.ciStatus === "failure";
    return matchesSearch && repo.status === activeFilter;
  });

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      
      {/* Search Console Input (form layout) */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="relative flex items-center bg-black/60 border border-neon-green/15 rounded-xl px-4 py-3 shadow-inner"
      >
        <span className="text-neon-green/50 font-mono text-xs mr-2.5 select-none">$</span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="filter local repos, or press Enter with @handle to lookup public profiles..."
          className="flex-1 bg-transparent outline-none border-none font-mono text-xs text-neon-green placeholder-neutral-700 w-full"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-neutral-500 hover:text-neon-green transition-colors cursor-pointer text-[10px] font-mono border border-neutral-800 rounded px-1.5 py-0.5 bg-black/45"
          >
            clear [×]
          </button>
        )}
      </form>

      {/* Filter Tabs Container */}
      <div className="flex items-center justify-between border-b border-neon-green/5 pb-2 font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "need attention", "hot", "busy", "fresh", "dev"].map((filter) => {
            const count = repos.filter((r) => {
              if (filter === "all") return true;
              if (filter === "need attention") return r.ciStatus === "failure";
              return r.status === filter;
            }).length;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                  activeFilter === filter
                    ? "bg-neon-green/10 border-neon-green text-neon-green font-bold shadow-[0_0_8px_rgba(163,255,18,0.1)]"
                    : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-800"
                }`}
              >
                {filter}
                <span className={`ml-1 text-[8px] opacity-60 ${activeFilter === filter ? "text-neon-green" : "text-neutral-600"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-[9px] text-neutral-500 uppercase tracking-widest hidden md:inline">
          {filteredRepos.length} Repositories Indexed
        </div>
      </div>

      {/* High-density Table */}
      <div className="w-full bg-[#0a0a0a]/50 border border-neon-green/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neon-green/10 bg-black/40 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                <th className="py-3 px-4 font-semibold">Repo</th>
                <th className="py-3 px-4 font-semibold text-right">Stars</th>
                <th className="py-3 px-4 font-semibold">Release</th>
                <th className="py-3 px-4 font-semibold text-center">Since</th>
                <th className="py-3 px-4 font-semibold">Activity</th>
                <th className="py-3 px-2 font-semibold text-center">Issues</th>
                <th className="py-3 px-2 font-semibold text-center">PRs</th>
                <th className="py-3 px-4 font-semibold text-right">CI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neon-green/5">
              {filteredRepos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
                    No repositories matching criteria resolved.
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo) => {
                  const isExpanded = expandedRepo === repo.name;
                  return (
                    <React.Fragment key={repo.name}>
                      <tr 
                        onClick={() => toggleRow(repo.name)}
                        className={`group border-l-2 transition-all hover:bg-black/30 cursor-pointer ${
                          isExpanded 
                            ? "border-neon-green bg-black/20" 
                            : repo.ciStatus === "failure" 
                              ? "border-red-500/30 hover:border-red-500/70"
                              : "border-transparent hover:border-neon-green/30"
                        }`}
                      >
                        {/* REPO column */}
                        <td className="py-4 px-4 max-w-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-bold text-neon-green hover:underline">
                              {repo.name}
                            </span>
                            {repo.ciStatus === "failure" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{repo.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {repo.tags.map((tag) => (
                              <span 
                                key={tag} 
                                className="text-[8px] font-mono text-neutral-500 bg-neutral-900/60 border border-neutral-800 rounded px-1.5 py-0.5 group-hover:border-neon-green/10 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                            {repo.status !== "all" && (
                              <span className="text-[8px] font-mono font-bold text-neon-green/60 bg-neon-green/5 border border-neon-green/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
                                {repo.status}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* STARS column */}
                        <td className="py-4 px-4 font-mono text-xs font-semibold text-right text-sky-400">
                          {repo.stars}
                        </td>

                        {/* RELEASE column */}
                        <td className="py-4 px-4">
                          <div className="font-mono text-xs text-white/95">{repo.releaseDate}</div>
                          <div className="font-mono text-[9px] text-neon-green font-semibold mt-0.5">{repo.releaseVersion}</div>
                          <div className="text-[9px] text-neutral-500 mt-0.5">{repo.releaseRelative}</div>
                        </td>

                        {/* SINCE column */}
                        <td className="py-4 px-4 text-center font-mono text-xs font-bold text-yellow-500">
                          {repo.sinceRelease}
                        </td>

                        {/* ACTIVITY column */}
                        <td className="py-4 px-4">
                          <div className="text-[10px] text-neutral-400">{repo.activityTime}</div>
                          <div className="font-mono text-[9px] text-neutral-600 mt-1 uppercase">
                            commit: <span className="text-neon-green/70">{repo.activityHash}</span>
                          </div>
                        </td>

                        {/* ISSUES column */}
                        <td className={`py-4 px-2 text-center font-mono text-xs ${repo.issuesCount > 0 ? "text-red-400 font-bold" : "text-neutral-600"}`}>
                          {repo.issuesCount}
                        </td>

                        {/* PRS column */}
                        <td className={`py-4 px-2 text-center font-mono text-xs ${repo.prsCount > 0 ? "text-sky-400 font-bold" : "text-neutral-600"}`}>
                          {repo.prsCount}
                        </td>

                        {/* CI column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                              {repo.ciStatus === "success" ? (
                                <>
                                  <span className="text-[9px] font-mono text-neon-green font-bold uppercase tracking-wider">success</span>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shadow-neon" />
                                </>
                              ) : repo.ciStatus === "failure" ? (
                                <>
                                  <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-wider animate-pulse">failed</span>
                                  <XCircle className="w-3.5 h-3.5 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                                </>
                              ) : (
                                <>
                                  <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase tracking-wider">pending</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-600 border-t-neon-green animate-spin" />
                                </>
                              )}
                            </div>
                            <span className="text-[8px] font-mono text-neutral-500">{repo.ciChecks}</span>
                          </div>
                        </td>

                      </tr>

                      {/* Expanded row — tabbed panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="bg-black/35 border-l-2 border-neon-green/70">
                            <td colSpan={8} className="p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="font-mono text-xs border-t border-neon-green/5"
                              >
                                {/* ── Tab Bar ─────────────────────── */}
                                <div className="flex items-center gap-0 border-b border-neon-green/8 px-5 pt-3">
                                  <button
                                    onClick={() => setTab(repo.name, "metrics")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                      (repoTab[repo.name] ?? "metrics") === "metrics"
                                        ? "border-neon-green text-neon-green"
                                        : "border-transparent text-neutral-600 hover:text-neutral-300"
                                    }`}
                                  >
                                    <LayoutGrid className="w-3 h-3" />
                                    System Metrics
                                  </button>
                                  <button
                                    onClick={() => setTab(repo.name, "explorer")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                      repoTab[repo.name] === "explorer"
                                        ? "border-neon-green text-neon-green"
                                        : "border-transparent text-neutral-600 hover:text-neutral-300"
                                    }`}
                                  >
                                    <FolderCode className="w-3 h-3" />
                                    Source Explorer
                                  </button>
                                </div>

                                {/* ── Panel Content ───────────────── */}
                                <div className="px-5 py-4 space-y-3.5">

                                  {/* METRICS TAB */}
                                  {(repoTab[repo.name] ?? "metrics") === "metrics" && (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">{"// REPO_OPERATIONS:"} {repo.name}</span>
                                        <span className="text-[9px] text-neutral-600">ID: SHA256-REGISTRY-{repo.name.toUpperCase().replace("/", "-")}</span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left: Build Info */}
                                        <div className="bg-black/60 border border-neon-green/5 rounded-xl p-3.5 space-y-2">
                                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{"// SYSTEM_METRICS"}</div>
                                          <div className="flex justify-between">
                                            <span className="text-neutral-500">Security Scans:</span>
                                            <span className="text-neon-green">0 Vulnerabilities</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-neutral-500">Code Coverage:</span>
                                            <span className="text-white">96.4%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-neutral-500">Package Registry:</span>
                                            <span className="text-white">npm / GitHub Packages</span>
                                          </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="bg-black/60 border border-neon-green/5 rounded-xl p-3.5 flex flex-col justify-between items-start gap-4">
                                          <div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{"// ACTIONS"}</div>
                                            <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                                              Run cryptographic build validations or refresh repository metadata.
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {repo.ciStatus === "failure" ? (
                                              <button
                                                onClick={(e) => handleRecheck(e, repo.name)}
                                                disabled={recheckingRepo === repo.name}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 border border-red-500/40 hover:border-red-500 text-[10px] text-red-400 uppercase rounded-lg transition-all cursor-pointer font-bold disabled:opacity-50"
                                              >
                                                <RefreshCw className={`w-3 h-3 ${recheckingRepo === repo.name ? "animate-spin" : ""}`} />
                                                {recheckingRepo === repo.name ? "Rechecking..." : "Trigger CI Fix"}
                                              </button>
                                            ) : (
                                              <button
                                                onClick={(e) => handleRecheck(e, repo.name)}
                                                disabled={recheckingRepo === repo.name}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-neon-green/20 hover:border-neon-green text-[10px] text-neon-green uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                              >
                                                <Play className={`w-3 h-3 ${recheckingRepo === repo.name ? "animate-spin" : ""}`} />
                                                {recheckingRepo === repo.name ? "Running Build..." : "Run Manual CI Check"}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* SOURCE EXPLORER TAB */}
                                  {repoTab[repo.name] === "explorer" && ownerHandle && (
                                    <SourceExplorer
                                      owner={ownerHandle}
                                      repo={repo.name}
                                    />
                                  )}
                                  {repoTab[repo.name] === "explorer" && !ownerHandle && (
                                    <div className="text-[10px] text-neutral-600 font-mono py-4 text-center">
                                      LOADING PROFILE — SOURCE EXPLORER UNAVAILABLE
                                    </div>
                                  )}

                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
