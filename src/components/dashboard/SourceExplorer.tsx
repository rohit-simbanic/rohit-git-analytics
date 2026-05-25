"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Folder, FolderOpen, FileCode, FileText, File, ChevronRight, Loader2, AlertTriangle, X, Copy, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DirEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
}

interface FileData {
  type: "file";
  name: string;
  path: string;
  size: number;
  content: string;
  truncated: boolean;
}

interface DirData {
  type: "dir";
  entries: DirEntry[];
}

type CacheEntry = DirData | FileData;

// ─── Language / extension helpers ─────────────────────────────────────────────

const EXT_LANG: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
  cpp: "cpp", c: "c", cs: "csharp", php: "php", swift: "swift",
  kt: "kotlin", json: "json", md: "markdown", html: "html",
  css: "css", scss: "css", sh: "bash", yaml: "yaml", yml: "yaml",
  toml: "toml", env: "bash", lock: "text", txt: "text",
};

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXT_LANG[ext] || "text";
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const codeExts = ["ts", "tsx", "js", "jsx", "py", "go", "rs", "rb", "java", "cpp", "c", "cs", "php", "swift", "kt", "css", "scss", "html"];
  if (codeExts.includes(ext)) return <FileCode className="w-3.5 h-3.5 text-neon-green/70" />;
  if (["md", "txt", "env", "lock", "yaml", "yml", "toml"].includes(ext)) return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
  return <File className="w-3.5 h-3.5 text-neutral-500" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// ─── Lightweight Syntax Highlighter ───────────────────────────────────────────

function highlightLine(line: string, lang: string): React.ReactNode {
  if (lang === "markdown" || lang === "text") {
    return <span className="text-neutral-300">{line}</span>;
  }

  // Tokenize: string literals, comments, keywords, numbers
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const patterns: Array<{ regex: RegExp; className: string }> = [
    // Single-line comments
    { regex: /^(\/\/.*|#.*)/, className: "text-neutral-500 italic" },
    // Strings
    { regex: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, className: "text-amber-300/90" },
    // Numbers
    { regex: /^(\b\d+\.?\d*\b)/, className: "text-purple-400" },
    // Keywords
    {
      regex: /^(\b(?:import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|async|await|try|catch|throw|new|this|true|false|null|undefined|void|string|number|boolean|object|Array|Promise|default|switch|case|break|continue|in|of|typeof|keyof|readonly|public|private|protected|static|enum|namespace|module|declare|as|is)\b)/,
      className: "text-cyan-400",
    },
    // JSX tags / HTML
    { regex: /^(<\/?[A-Za-z][A-Za-z0-9.]*|>|\/>)/, className: "text-neon-green/80" },
    // Operators and punctuation
    { regex: /^([=!<>+\-*/&|^~?:;,(){}[\]])/, className: "text-neutral-400" },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, className } of patterns) {
      const m = remaining.match(regex);
      if (m) {
        parts.push(<span key={key++} className={className}>{m[1]}</span>);
        remaining = remaining.slice(m[1].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Emit single char as plain text
      parts.push(<span key={key++} className="text-neutral-300">{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }

  return <>{parts}</>;
}

// ─── Code Viewer ──────────────────────────────────────────────────────────────

interface CodeViewerProps {
  file: FileData;
  onClose: () => void;
}

function CodeViewer({ file, onClose }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const lang = getLang(file.name);

  const lines = useMemo(() => file.content.split("\n"), [file.content]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [file.content]);

  return (
    <div className="flex flex-col h-full min-h-[300px] max-h-[500px] bg-black/70 border border-neon-green/15 rounded-xl overflow-hidden font-mono">
      {/* File header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-neon-green/10 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(file.name)}
          <span className="text-[10px] text-neon-green/80 truncate">{file.path}</span>
          <span className="text-[9px] text-neutral-600 flex-shrink-0">[{lang.toUpperCase()}]</span>
          <span className="text-[9px] text-neutral-600 flex-shrink-0">{formatSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 text-[9px] text-neutral-400 hover:text-neon-green border border-neutral-800 hover:border-neon-green/30 rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
            {copied ? "COPIED" : "COPY"}
          </button>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {file.truncated && (
        <div className="px-4 py-1.5 bg-amber-950/20 border-b border-amber-500/20 text-[9px] text-amber-400/80 font-mono flex-shrink-0">
          ⚠ FILE TRUNCATED AT 100KB — Download full source on GitHub
        </div>
      )}

      {/* Code area */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-[11px] border-separate border-spacing-0">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-neon-green/[0.03] group">
                <td className="w-10 text-right pr-3 pl-2 text-neutral-700 group-hover:text-neutral-500 select-none border-r border-neon-green/5 py-0 leading-5 align-top flex-shrink-0">
                  {i + 1}
                </td>
                <td className="pl-4 pr-2 py-0 leading-5 whitespace-pre">
                  {highlightLine(line, lang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main SourceExplorer Component ────────────────────────────────────────────

interface SourceExplorerProps {
  owner: string;
  repo: string;
}

export const SourceExplorer: React.FC<SourceExplorerProps> = ({ owner, repo }) => {
  // Cache: path → DirData | FileData
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [currentPath, setCurrentPath] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null); // path being loaded
  const [error, setError] = useState<string | null>(null);
  const [openFile, setOpenFile] = useState<FileData | null>(null);

  const fetchEntry = useCallback(async (path: string) => {
    const cacheKey = path;
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (cached.type === "dir") setCurrentPath(path);
      if (cached.type === "file") setOpenFile(cached as FileData);
      return;
    }

    setLoading(path);
    setError(null);

    try {
      const qs = path ? `?path=${encodeURIComponent(path)}` : "";
      const res = await fetch(`/api/github/${owner}/${repo}/contents${qs}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load");
        return;
      }

      setCache((prev) => new Map(prev).set(cacheKey, data as CacheEntry));

      if (data.type === "dir") {
        setCurrentPath(path);
        setOpenFile(null);
      } else if (data.type === "file") {
        setOpenFile(data as FileData);
      }
    } catch {
      setError("Network error — could not reach GitHub API");
    } finally {
      setLoading(null);
    }
  }, [cache, owner, repo]);

  // Bootstrap: load root on mount (deferred to avoid synchronous state update in effect)
  React.useEffect(() => {
    const timer = setTimeout(() => fetchEntry(""), 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  // Current directory entries
  const currentDir = cache.get(currentPath);
  const entries: DirEntry[] = (currentDir?.type === "dir" ? currentDir.entries : []);

  // Breadcrumb segments
  const crumbs = useMemo(() => {
    const parts = currentPath ? currentPath.split("/") : [];
    return [{ label: repo, path: "" }, ...parts.map((p, i) => ({
      label: p,
      path: parts.slice(0, i + 1).join("/"),
    }))];
  }, [currentPath, repo]);

  return (
    <div className="flex flex-col gap-3 font-mono text-xs">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 flex-wrap text-[10px] text-neutral-500">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-neutral-700 flex-shrink-0" />}
            <button
              onClick={() => fetchEntry(crumb.path)}
              className={`hover:text-neon-green transition-colors cursor-pointer ${
                crumb.path === currentPath ? "text-neon-green" : "text-neutral-500"
              }`}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
        {loading && <Loader2 className="w-3 h-3 text-neon-green/60 animate-spin ml-1" />}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/20 rounded-lg text-[10px] text-red-400">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Split: file tree + code viewer */}
      <div className={`grid gap-3 ${openFile ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* File Tree */}
        <div className="bg-black/50 border border-neon-green/10 rounded-xl overflow-hidden">
          {/* Tree header */}
          <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-neon-green/8">
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">
              {"// FILE_SYSTEM"}
            </span>
            <span className="text-[9px] text-neutral-700">{entries.length} entries</span>
          </div>

          {/* Loading skeleton */}
          {loading === currentPath && entries.length === 0 && (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-6 bg-neon-green/5 rounded animate-pulse" style={{ width: `${50 + n * 12}%` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && entries.length === 0 && !error && (
            <div className="p-4 text-[10px] text-neutral-600 text-center">EMPTY DIRECTORY</div>
          )}

          {/* Entries list */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {entries.map((entry) => {
              const isLoadingThis = loading === entry.path;
              return (
                <button
                  key={entry.path}
                  onClick={() => fetchEntry(entry.path)}
                  disabled={isLoadingThis}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neon-green/5 transition-colors border-b border-neon-green/5 last:border-b-0 cursor-pointer disabled:opacity-50 ${
                    openFile?.path === entry.path ? "bg-neon-green/[0.08] border-l-2 border-l-neon-green/50" : ""
                  }`}
                >
                  {isLoadingThis ? (
                    <Loader2 className="w-3.5 h-3.5 text-neon-green/60 animate-spin flex-shrink-0" />
                  ) : entry.type === "dir" ? (
                    currentPath && entry.path.startsWith(currentPath)
                      ? <FolderOpen className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                      : <Folder className="w-3.5 h-3.5 text-amber-400/50 flex-shrink-0" />
                  ) : (
                    getFileIcon(entry.name)
                  )}
                  <span className={`text-[11px] truncate ${
                    entry.type === "dir" ? "text-neutral-200" : "text-neutral-400"
                  }`}>
                    {entry.name}
                    {entry.type === "dir" && "/"}
                  </span>
                  {entry.type === "file" && entry.size > 0 && (
                    <span className="ml-auto text-[9px] text-neutral-700 flex-shrink-0">
                      {formatSize(entry.size)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        {openFile && (
          <CodeViewer
            file={openFile}
            onClose={() => setOpenFile(null)}
          />
        )}
      </div>
    </div>
  );
};
