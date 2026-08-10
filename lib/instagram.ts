import type { DownloadResult, MediaItem, MediaType } from "@/types";
import {
  applyProxyToEnv,
  buildAttemptOrder,
  clearProxyFromEnv
} from "@/lib/proxyRotator";
import {
  ensureGlobalAgentBootstrapped,
  syncProxyIntoGlobalAgent
} from "@/lib/globalAgentBootstrap";

const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_\-.]+/i;

export function isSupportedInstagramUrl(url: string): boolean {
  return INSTAGRAM_URL_PATTERN.test(url.trim());
}

function normalizeCaption(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const clean = raw.trim();
  return clean.length > 220 ? `${clean.slice(0, 217)}...` : clean;
}

function deriveTitle(username: string, caption: string): string {
  if (caption) return caption.split("\n")[0].slice(0, 90);
  if (username) return `Post by @${username}`;
  return "Instagram media";
}

/**
 * instagram-url-direct's exact response shape has drifted across versions,
 * so this normalizer reads defensively instead of assuming one schema.
 */
function normalizeResult(sourceUrl: string, raw: any): DownloadResult {
  const details: any[] = Array.isArray(raw?.media_details)
    ? raw.media_details
    : [];
  const postInfo = raw?.post_info || {};

  let items: MediaItem[] = details.map((d) => ({
    type: d?.type === "image" ? "image" : "video",
    downloadUrl: d?.url,
    thumbnail: d?.thumbnail || undefined
  }));

  if (items.length === 0 && Array.isArray(raw?.url_list)) {
    items = raw.url_list.map((u: string) => ({
      type: "video" as const,
      downloadUrl: u
    }));
  }

  items = items.filter((i) => typeof i.downloadUrl === "string" && i.downloadUrl);

  if (items.length === 0) {
    throw new Error(
      "This link did not return a downloadable file. It may be private, deleted, or age-restricted."
    );
  }

  const mediaType: MediaType = items.length > 1 ? "carousel" : items[0].type;
  const username: string = postInfo.owner_username || "";
  const caption = normalizeCaption(postInfo.caption);
  const thumbnail =
    items.find((i) => i.thumbnail)?.thumbnail || items[0].thumbnail || "";

  return {
    success: true,
    sourceUrl,
    title: deriveTitle(username, caption),
    caption,
    username,
    thumbnail,
    mediaType,
    items
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Request to Instagram timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Fetches direct media URLs for an Instagram post/reel, rotating through
 * the PROXY_LIST pool (up to 40 proxies) one by one whenever a proxy
 * fails, times out, or gets rate-limited/blocked.
 */
export async function fetchInstagramMedia(url: string): Promise<DownloadResult> {
  const pool = buildAttemptOrder();
  const sequence: (string | null)[] = pool.length > 0 ? pool : [null];

  const perAttemptTimeoutMs = Number(process.env.PROXY_ATTEMPT_TIMEOUT_MS) || 15000;
  const maxAttempts = Math.min(
    sequence.length,
    Number(process.env.MAX_PROXY_ATTEMPTS) || sequence.length
  );

  ensureGlobalAgentBootstrapped();

  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const proxy = sequence[attempt];

    try {
      applyProxyToEnv(proxy);
      syncProxyIntoGlobalAgent();

      // FIX: Vercel bundler compatibility logic
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const igModule = require("instagram-url-direct");
      
      // Handle different export patterns (CommonJS vs transpiled ES Module)
      const fetchIg = typeof igModule === "function" ? igModule : (igModule.default || igModule.instagramGetUrl);
      
      if (typeof fetchIg !== "function") {
        throw new Error("Library function bundler ki wajah se map nahi ho paayi.");
      }

      const raw = await withTimeout(fetchIg(url), perAttemptTimeoutMs);
      return normalizeResult(url, raw);
    } catch (err) {
      lastError = err;
      // Automatically shift to proxy #(attempt + 2) on the next loop turn.
      continue;
    } finally {
      clearProxyFromEnv();
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown scraping error";
  throw new Error(
    maxAttempts > 1
      ? `Tried ${maxAttempts} proxies and all failed. Last error: ${message}`
      : message
  );
}
