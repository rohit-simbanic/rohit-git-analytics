export interface RepoItem {
  name: string;
  description: string;
  tags: string[];
  stars: string;
  releaseDate: string;
  releaseVersion: string;
  releaseRelative: string;
  sinceRelease: number;
  activityTime: string;
  activityHash: string;
  issuesCount: number;
  prsCount: number;
  ciStatus: "success" | "failure" | "pending";
  ciChecks: string; // e.g. "6/6 checks"
  status: "all" | "need attention" | "hot" | "busy" | "fresh" | "dev";
}

export interface DeveloperProfile {
  handle: string;
  avatarUrl: string;
  trustScore: number;
  trustRating: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  githubAge: string;
  followers: string;
  activeRepos: number;
  workingSummary: string;
  stats: {
    commits: number;
    prs: number;
    issues: number;
    comments: number;
  };
  repoContributions: { name: string; count: number }[];
}

export const MOCK_PROFILE: DeveloperProfile = {
  handle: "@steipete",
  avatarUrl: "https://avatars.githubusercontent.com/u/10496?v=4", // steipete's actual github avatar or similar
  trustScore: 91,
  trustRating: "HIGH",
  githubAge: "17 years on GitHub",
  followers: "50K followers",
  activeRepos: 7,
  workingSummary: "openclaw received a dense round of fixes and follow-up branches covering gateway metadata caching, WebChat completion timing, PDF fallback handling for MiniMax models, Telegram preview retention, Twitch auth binding, realtime voice controls, and context window recalculation bugs. Multiple repos advanced in parallel, including clawsweeper freshness rechecks, crabbox failure-classification work, Peekaboo CLI ergonomics, crabfleet updates, birdclaw commits, and documentation updates across openclaw/docs. The week also included publishing the openclaw 2026.5.22 release, merging related pull requests, and localization discussion and commits in CodexBar for Traditional Chinese support.",
  stats: {
    commits: 170,
    prs: 41,
    issues: 18,
    comments: 41,
  },
  repoContributions: [
    { name: "openclaw/openclaw", count: 150 },
    { name: "steipete/IndexBar", count: 19 },
    { name: "openclaw/docs", count: 14 },
    { name: "openclaw/clawsweeper", count: 11 },
    { name: "openclaw/crabbox", count: 13 },
  ],
};

export const MOCK_REPOS: RepoItem[] = [
  {
    name: "steipete/CodexBar",
    description: "Show usage stats for OpenAI Codex and Claude's Code, without having to login.",
    tags: ["swift", "ai", "codex", "swift", "claude-code"],
    stars: "13K",
    releaseDate: "May 22, 2026",
    releaseVersion: "v0.29.0",
    releaseRelative: "1 day ago",
    sinceRelease: 10,
    activityTime: "1 day ago",
    activityHash: "94f031e",
    issuesCount: 11,
    prsCount: 7,
    ciStatus: "success",
    ciChecks: "6/6 checks",
    status: "busy",
  },
  {
    name: "steipete/oracle",
    description: "Ask the oracle when you're stuck. Invoke GPT-5 Pro with a custom context and files.",
    tags: ["typescript", "agents", "ai", "gpt-5-pro", "anthropic", "wars"],
    stars: "2.3K",
    releaseDate: "May 22, 2026",
    releaseVersion: "v0.13.0",
    releaseRelative: "1 day ago",
    sinceRelease: 1,
    activityTime: "1 day ago",
    activityHash: "e8fefeb",
    issuesCount: 0,
    prsCount: 1,
    ciStatus: "success",
    ciChecks: "3/3 checks",
    status: "dev",
  },
  {
    name: "steipete/birdclaw",
    description: "Stores all your tweets nicely claw-able for agents.",
    tags: ["TypeScript", "twitter", "agents", "crawler"],
    stars: "642",
    releaseDate: "May 22, 2026",
    releaseVersion: "v0.6.0",
    releaseRelative: "2 days ago",
    sinceRelease: 6,
    activityTime: "1 day ago",
    activityHash: "a4d659f",
    issuesCount: 0,
    prsCount: 0,
    ciStatus: "success",
    ciChecks: "1/1 checks",
    status: "busy",
  },
  {
    name: "openclaw/openclaw",
    description: "A highly resilient CLI framework for scheduling and running autonomous agent jobs.",
    tags: ["Go", "cli", "agents", "orchestration"],
    stars: "4.1K",
    releaseDate: "May 24, 2026",
    releaseVersion: "v1.2.0",
    releaseRelative: "12 hours ago",
    sinceRelease: 12,
    activityTime: "3 hours ago",
    activityHash: "bf83c7a",
    issuesCount: 4,
    prsCount: 3,
    ciStatus: "success",
    ciChecks: "12/12 checks",
    status: "hot",
  },
  {
    name: "openclaw/clawsweeper",
    description: "Automated hygiene utility to sweep stale caches, dangling memory, and untracked container layers.",
    tags: ["rust", "docker", "memory", "hygiene"],
    stars: "1.2K",
    releaseDate: "May 15, 2026",
    releaseVersion: "v0.8.2",
    releaseRelative: "10 days ago",
    sinceRelease: 24,
    activityTime: "5 hours ago",
    activityHash: "d2cf99a",
    issuesCount: 12,
    prsCount: 2,
    ciStatus: "failure",
    ciChecks: "2/3 checks",
    status: "need attention",
  },
  {
    name: "openclaw/crabbox",
    description: "Secure, sandboxed lightweight virtualization for running untrusted binary actions inside nodes.",
    tags: ["Rust", "security", "sandbox", "wasm"],
    stars: "8.5K",
    releaseDate: "May 25, 2026",
    releaseVersion: "v0.1.0",
    releaseRelative: "1 hour ago",
    sinceRelease: 0,
    activityTime: "45 mins ago",
    activityHash: "9f7a2db",
    issuesCount: 2,
    prsCount: 1,
    ciStatus: "success",
    ciChecks: "8/8 checks",
    status: "fresh",
  },
  {
    name: "steipete/IndexBar",
    description: "A beautiful visual navigation dashboard overlay for rendering massive directory maps and index streams.",
    tags: ["Swift", "ui", "navigation", "layout"],
    stars: "1.8K",
    releaseDate: "May 23, 2026",
    releaseVersion: "v0.4.1",
    releaseRelative: "2 days ago",
    sinceRelease: 3,
    activityTime: "1 day ago",
    activityHash: "cb58ad1",
    issuesCount: 1,
    prsCount: 0,
    ciStatus: "success",
    ciChecks: "4/4 checks",
    status: "fresh",
  },
];

export const MOCK_COMMIT_ACTIVITY = [
  { day: "Mon", commits: 25, additions: 1400, deletions: 250 },
  { day: "Tue", commits: 38, additions: 2900, deletions: 120 },
  { day: "Wed", commits: 15, additions: 800, deletions: 50 },
  { day: "Thu", commits: 42, additions: 3500, deletions: 600 },
  { day: "Fri", commits: 30, additions: 1800, deletions: 400 },
  { day: "Sat", commits: 8, additions: 400, deletions: 20 },
  { day: "Sun", commits: 12, additions: 600, deletions: 80 },
];

export const MOCK_LANGUAGES = [
  { name: "Swift", value: 38, color: "#F05138" },
  { name: "TypeScript", value: 28, color: "#3178C6" },
  { name: "Go", value: 18, color: "#00ADD8" },
  { name: "Rust", value: 16, color: "#DEA584" },
];
