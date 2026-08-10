"use client";

import { useState, FormEvent } from "react";
import { Link2, Loader2, AlertCircle, Instagram, ArrowRight } from "lucide-react";
import LiquidBackdrop from "@/components/LiquidBackdrop";
import Logo from "@/components/Logo";
import MediaPreview from "@/components/MediaPreview";
import type { DownloadResponse, DownloadResult } from "@/types";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || status === "loading") return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });

      const data: DownloadResponse = await res.json();

      if (!data.success) {
        setStatus("error");
        setError(data.error);
        return;
      }

      setResult(data);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  const isLoading = status === "loading";

  return (
    <main className="relative min-h-screen w-full">
      <LiquidBackdrop />

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:py-12">
        <header className="flex items-center justify-between">
          <Logo />
          <span className="glass-chip hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-muted">
            <Instagram size={13} />
            Instagram, ready now
          </span>
        </header>

        <section className="mt-14 sm:mt-20 text-center">
          <h1 className="font-display text-3xl sm:text-[2.6rem] font-semibold leading-tight tracking-tight text-ink">
            Paste a link.
            <br />
            <span className="bg-gradient-to-r from-spectrum-violet via-spectrum-cyan to-spectrum-magenta bg-clip-text text-transparent">
              Get the file.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.95rem] text-ink-muted">
            Drop in an Instagram Reel, Post, or IGTV link and Glassreel hands
            back a direct MP4 you can save in one tap.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className={`liquid-capsule ${isLoading ? "is-loading" : ""}`}>
            <div className="liquid-capsule-inner">
              <Link2 size={18} className="text-ink-faint shrink-0" />
              <input
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://www.instagram.com/reel/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                aria-label="Instagram video URL"
                required
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-void-deep transition-opacity disabled:opacity-40 sm:px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="hidden sm:inline">Fetching</span>
                  </>
                ) : (
                  <>
                    <span>Download</span>
                    <ArrowRight size={16} className="hidden sm:inline" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 flex-1">
          {status === "error" ? (
            <div className="glass-panel flex items-start gap-3 border-red-400/20 p-4 animate-rise">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-300" />
              <div>
                <p className="text-sm font-medium text-ink">Couldn't fetch this link</p>
                <p className="mt-0.5 text-sm text-ink-muted">{error}</p>
              </div>
            </div>
          ) : null}

          {status === "loading" ? (
            <div className="glass-panel flex items-center gap-4 p-5">
              <div className="h-16 w-16 shrink-0 rounded-2xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded-full shimmer" />
                <div className="h-3 w-1/2 rounded-full shimmer" />
                <div className="h-3 w-2/3 rounded-full shimmer" />
              </div>
            </div>
          ) : null}

          {status === "success" && result ? <MediaPreview result={result} /> : null}

          {status === "idle" ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              {["Reels", "Posts", "IGTV"].map((label) => (
                <div key={label} className="glass-chip rounded-2xl px-3 py-4 text-xs font-medium text-ink-muted">
                  {label}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="mt-10 text-center text-xs text-ink-faint">
          Only download content you own or have permission to save.
        </footer>
      </div>
    </main>
  );
}
