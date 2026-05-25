import { NextRequest, NextResponse } from "next/server";

interface GitHubContentEntry {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  download_url: string | null;
  content?: string;
  encoding?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; repo: string }> }
) {
  try {
    const { username, repo } = await params;
    const { searchParams } = new URL(request.url);
    const rawPath = searchParams.get("path") || "";

    // Sanitize username and repo
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(repo)) {
      return NextResponse.json({ error: "Invalid repository name format" }, { status: 400 });
    }

    // Sanitize path: allow alphanumeric, slashes, dots, dashes, underscores only
    // Prevent path traversal
    const safePath = rawPath
      .replace(/\.\./g, "") // strip traversal sequences
      .replace(/^\/+/, "") // strip leading slashes
      .trim();

    if (safePath && !/^[a-zA-Z0-9_./ -]+$/.test(safePath)) {
      return NextResponse.json({ error: "Invalid path format" }, { status: 400 });
    }

    // Build auth headers
    const clientId = process.env.GITHUB_ID;
    const clientSecret = process.env.GITHUB_SECRET;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "dev-terminal-dashboard",
    };
    if (clientId && clientSecret && clientId !== "MOCK_CLIENT_ID") {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    const apiPath = safePath
      ? `https://api.github.com/repos/${username}/${repo}/contents/${safePath}`
      : `https://api.github.com/repos/${username}/${repo}/contents`;

    const res = await fetch(apiPath, { headers });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Path not found in repository" }, { status: 404 });
      }
      if (res.status === 403) {
        return NextResponse.json({ error: "GitHub API rate limit exceeded. Try again later." }, { status: 429 });
      }
      return NextResponse.json({ error: "GitHub API error" }, { status: res.status });
    }

    const data: GitHubContentEntry | GitHubContentEntry[] = await res.json();

    // Directory listing
    if (Array.isArray(data)) {
      const entries = data
        .filter((e) => e.type === "file" || e.type === "dir")
        .map((e) => ({
          name: e.name,
          path: e.path,
          type: e.type,
          size: e.size,
        }))
        .sort((a, b) => {
          // Directories first, then files alphabetically
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

      return NextResponse.json({ type: "dir", entries });
    }

    // Single file
    if (data.type === "file") {
      // Decode base64 content on server
      const rawContent = data.content || "";
      const decoded = Buffer.from(rawContent.replace(/\n/g, ""), "base64").toString("utf-8");

      // Cap file content at 100KB to avoid overwhelming the UI
      const MAX_CHARS = 100_000;
      const truncated = decoded.length > MAX_CHARS;
      const content = truncated ? decoded.slice(0, MAX_CHARS) + "\n\n// ... [TRUNCATED — FILE TOO LARGE] ..." : decoded;

      return NextResponse.json({
        type: "file",
        name: data.name,
        path: data.path,
        size: data.size,
        content,
        truncated,
      });
    }

    return NextResponse.json({ error: "Unsupported entry type" }, { status: 400 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("GitHub Contents API Error:", err.message);
    return NextResponse.json({ error: "Server exception: " + err.message }, { status: 500 });
  }
}
