import { create } from "zustand";
import { RepoItem, DeveloperProfile } from "@/lib/mockData";

export interface CommandLog {
  command: string;
  output: string;
  timestamp: string;
  type: "input" | "system" | "success" | "error";
}

interface DashboardState {
  profile: DeveloperProfile;
  repos: RepoItem[];
  searchQuery: string;
  activeFilter: string;
  terminalHistory: CommandLog[];
  isTerminalExpanded: boolean;
  fetchStatus: "idle" | "loading" | "error";
  fetchError: string;
  
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: string) => void;
  addTerminalCommand: (command: string, output: string, type?: "input" | "system" | "success" | "error") => void;
  clearTerminalHistory: () => void;
  toggleTerminalExpanded: () => void;
  triggerCIRecheck: (repoName: string) => void;
  triggerHackSimulate: () => void;
  fetchUserProfile: (username: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: {
    handle: "",
    avatarUrl: "",
    trustScore: 0,
    trustRating: "HIGH" as const,
    githubAge: "",
    githubAgeEpoch: undefined,
    followers: "",
    activeRepos: 0,
    workingSummary: "",
    stats: {
      commits: 0,
      prs: 0,
      issues: 0,
      comments: 0,
    },
    repoContributions: [],
    commitActivity: [],
  },
  repos: [],
  searchQuery: "",
  activeFilter: "all",
  terminalHistory: [
    {
      command: "sysinfo",
      output: "HOST: dev.terminal.secured // KERNEL: next-v16.2.6 // STATUS: SECURED // DECRYPTOR: ACTIVE",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
    },
    {
      command: "welcome",
      output: "Welcome back, Operator. Cybernetic analytics core initialized successfully.",
      timestamp: new Date().toLocaleTimeString(),
      type: "success",
    },
  ],
  isTerminalExpanded: false,
  fetchStatus: "idle",
  fetchError: "",

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  
  addTerminalCommand: (command, output, type = "input") => set((state) => ({
    terminalHistory: [
      ...state.terminalHistory,
      {
        command,
        output,
        timestamp: new Date().toLocaleTimeString(),
        type,
      },
    ].slice(-50), // Limit history size
  })),

  clearTerminalHistory: () => set({ terminalHistory: [] }),

  toggleTerminalExpanded: () => set((state) => ({ isTerminalExpanded: !state.isTerminalExpanded })),

  triggerCIRecheck: (repoName) => {
    set((state) => {
      const updatedRepos = state.repos.map((repo) => {
        if (repo.name === repoName) {
          return {
            ...repo,
            ciStatus: "success" as const,
            ciChecks: repo.ciChecks.includes("/") 
              ? repo.ciChecks.split("/").map((_, i, arr) => arr[1] || "3").join("/") 
              : "6/6 checks",
            releaseRelative: "just now",
            activityTime: "just now",
          };
        }
        return repo;
      });

      const failedCount = updatedRepos.filter((r) => r.ciStatus === "failure").length;
      const score = Math.max(70, 98 - failedCount * 8);

      return {
        repos: updatedRepos,
        profile: {
          ...state.profile,
          trustScore: score,
          trustRating: score > 90 ? "HIGH" : score > 80 ? "MEDIUM" : "LOW",
        },
      };
    });
  },

  triggerHackSimulate: () => {
    set((state) => {
      const updatedRepos = state.repos.map((repo) => ({
        ...repo,
        ciStatus: "success" as const,
        stars: repo.stars.includes("K")
          ? (parseFloat(repo.stars) + 0.1).toFixed(1) + "K"
          : String(parseInt(repo.stars || "0") + 1),
      }));
      
      const newCommits = state.profile.stats.commits + 42;
      const score = 99;

      return {
        repos: updatedRepos,
        profile: {
          ...state.profile,
          trustScore: score,
          trustRating: "HIGH" as const,
          followers: state.profile.followers.includes("followers")
            ? (parseFloat(state.profile.followers) + 1).toFixed(1) + "K followers"
            : String(parseInt(state.profile.followers || "0") + 1) + " followers",
          stats: {
            ...state.profile.stats,
            commits: newCommits,
            prs: state.profile.stats.prs + 8,
          },
        },
      };
    });
  },

  fetchUserProfile: async (username) => {
    const cleanUsername = username.replace(/^@/, "").trim();
    if (!cleanUsername) return;

    set({ fetchStatus: "loading", fetchError: "" });
    get().addTerminalCommand(`query-api --user ${cleanUsername}`, `Resolving developer node @${cleanUsername}...`, "input");

    try {
      const res = await fetch(`/api/github/${cleanUsername}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Node resolution returned error code ${res.status}`);
      }

      const data = await res.json();
      set({
        profile: data.profile,
        repos: data.repos,
        fetchStatus: "idle",
      });

      get().addTerminalCommand(
        "query-resolved",
        `Profile @${cleanUsername} resolved successfully. Trust score evaluated: ${data.profile.trustScore}.`,
        "success"
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to query developer node";
      set({
        fetchStatus: "error",
        fetchError: errMsg,
      });

      get().addTerminalCommand(
        "query-failed",
        `ERR: Failed to resolve node @${cleanUsername}: ${errMsg}`,
        "error"
      );
    }
  },
}));
