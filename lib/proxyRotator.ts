/**
 * Anti-ban proxy rotation engine.
 *
 * PROXY_LIST is a comma-separated list of authenticated proxies, e.g. Webshare:
 *   http://USER:[email protected]:PORT,http://USER:[email protected]:PORT,...
 *
 * Behaviour required by the product spec:
 *  - Up to 40 proxies are tracked.
 *  - One proxy is used per request.
 *  - If a proxy is exhausted / blocked / errors out, the rotator automatically
 *    shifts to the next proxy in the list (proxy #1 -> #2 -> #3 ... -> #40 -> #1)
 *    so a single request can retry across the whole pool without ever
 *    reusing a proxy that just failed.
 *
 * NOTE: This module keeps its cursor in memory. On a warm serverless
 * container the cursor persists between invocations (true round robin
 * across requests). On a cold start it simply resets to the first proxy -
 * which is fine, since the failover-on-error logic below still walks the
 * full pool for that single request regardless of where the cursor starts.
 */

const MAX_PROXIES = 40;

let cursor = 0;

function parseProxyList(): string[] {
  const raw = process.env.PROXY_LIST || "";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, MAX_PROXIES);
}

export function getProxyPoolSize(): number {
  return parseProxyList().length;
}

/**
 * Returns the ordered list of proxies to attempt for a single request,
 * starting at the current rotation cursor and wrapping around the pool
 * exactly once (so every proxy from 1 to 40 gets a turn, one by one).
 * Advances the shared cursor so the *next* request starts on a fresh proxy.
 */
export function buildAttemptOrder(): string[] {
  const pool = parseProxyList();
  if (pool.length === 0) return [];

  const start = cursor % pool.length;
  const ordered: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    ordered.push(pool[(start + i) % pool.length]);
  }

  // Shift the cursor forward by one so the next incoming request begins
  // on the next proxy in line, rather than hammering the same one.
  cursor = (start + 1) % pool.length;

  return ordered;
}

/**
 * Applies a single proxy to the process environment so that any HTTP
 * client (including the ones used internally by instagram-url-direct)
 * that reads HTTP_PROXY / HTTPS_PROXY will route through it.
 */
export function applyProxyToEnv(proxyUrl: string | null): void {
  if (!proxyUrl) {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    return;
  }

  process.env.HTTP_PROXY = proxyUrl;
  process.env.HTTPS_PROXY = proxyUrl;
  process.env.http_proxy = proxyUrl;
  process.env.https_proxy = proxyUrl;
}

export function clearProxyFromEnv(): void {
  applyProxyToEnv(null);
}
