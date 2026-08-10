# Glassreel - All-in-One Video Downloader

A production-ready Next.js 14 app that pulls a direct, downloadable MP4/JPG
link from an Instagram Reel, Post, or IGTV URL - no Puppeteer, no headless
browser, just a lightweight scraping package behind a rotating-proxy
serverless API. Built to be extended to other platforms later.

## What's included

- **Frontend** - Next.js App Router + Tailwind, a "liquid glass" UI: a
  translucent, animated-gradient capsule input, glass preview card with
  thumbnail/title/caption/username, loading skeleton, and clear error states.
  All icons are real SVG icon components (`lucide-react`) - no emoji.
- **Backend** - `POST /api/download`, a Node.js serverless route that
  validates the URL, calls the scraper, and returns normalized JSON.
- **Scraper** - `instagram-url-direct`, wrapped in `lib/instagram.ts`.
- **Anti-ban proxy rotation** - `lib/proxyRotator.ts` + `lib/globalAgentBootstrap.ts`.
- **Forced download route** - `GET /api/proxy-download` streams the media
  back with a `Content-Disposition: attachment` header so the button always
  saves a file instead of opening the CDN link in a new tab.

## How the proxy rotation works

1. `PROXY_LIST` is a comma-separated list of authenticated proxies
   (Webshare format works out of the box):
   ```
   PROXY_LIST=http://user1:[email protected]:6001,http://user2:[email protected]:6002,...
   ```
   Up to **40** proxies are read from the list.
2. On every request, `buildAttemptOrder()` starts at an internal round-robin
   cursor and returns the proxies in order starting from there - so
   consecutive requests spread across the whole pool instead of hammering
   proxy #1 every time.
3. `fetchInstagramMedia()` walks that order **one proxy at a time**: it sets
   `process.env.HTTP_PROXY` / `process.env.HTTPS_PROXY` to the current
   proxy, calls `instagram-url-direct`, and if that call throws (timeout,
   407/403, IP ban, rate limit, etc.) it automatically **shifts to the next
   proxy** in the list and retries - continuing across the full pool
   (1 -> 2 -> 3 ... up to 40) until one succeeds or every proxy has been tried.
4. `lib/globalAgentBootstrap.ts` bootstraps `global-agent` once per
   container and mirrors `HTTP_PROXY`/`HTTPS_PROXY` into the
   `GLOBAL_AGENT_*` variables it reads. This is what makes the proxy
   actually apply to every outbound HTTP call in the process - including
   the ones made internally by `instagram-url-direct` - not just calls you
   write yourself.
5. Tune `MAX_PROXY_ATTEMPTS` and `PROXY_ATTEMPT_TIMEOUT_MS` in `.env` if your
   hosting platform has a short function timeout (e.g. Vercel Hobby caps
   functions at 10s, so trying all 40 proxies sequentially may not fit -
   lower `MAX_PROXY_ATTEMPTS` to something like 5-8 in that case).

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your real PROXY_LIST
npm run dev
```

Open `http://localhost:3000`, paste an Instagram Reel/Post URL, and press
**Download**.

## Deploying

Works unmodified on Vercel or any platform that runs Next.js serverless
functions on the **Node.js runtime** (both API routes explicitly set
`export const runtime = "nodejs"` - required because `instagram-url-direct`
and the proxy agent rely on Node's `http`/`https` modules, which aren't
available on the Edge runtime).

On Vercel: import the repo, add `PROXY_LIST` (and optionally
`MAX_PROXY_ATTEMPTS`, `PROXY_ATTEMPT_TIMEOUT_MS`) under **Project Settings ->
Environment Variables**, then deploy.

## Project structure

```
app/
  api/
    download/route.ts         # POST /api/download - main scraping endpoint
    proxy-download/route.ts   # GET  /api/proxy-download - forces file download
  layout.tsx                  # fonts + metadata
  page.tsx                    # UI: input, states, preview
  globals.css                 # liquid-glass design system (CSS)
components/
  LiquidBackdrop.tsx           # animated ambient background
  Logo.tsx                     # brand mark (SVG icon, not emoji)
  MediaPreview.tsx              # result card + download button(s)
lib/
  instagram.ts                 # scraping + normalization + retry loop
  proxyRotator.ts               # round-robin + failover proxy selection
  globalAgentBootstrap.ts       # makes HTTP_PROXY actually take effect
types/
  index.ts                     # shared API/UI types
.env.example
tailwind.config.ts              # color/type/shadow/animation tokens
```

## Extending to other platforms

The API contract (`{ url } -> { success, mediaType, items[] }`) is
platform-agnostic on purpose. To add YouTube, TikTok, etc., add a
`lib/<platform>.ts` with its own extractor, detect the platform by URL
pattern in `app/api/download/route.ts`, and route to the right extractor -
the frontend and proxy-download route need no changes.

## Notes on Instagram's terms

Automated scraping of Instagram may violate its Terms of Service. This
project is provided for educational/personal-use purposes; only download
content you own or have explicit permission to save.
