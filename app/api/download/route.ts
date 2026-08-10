import { NextRequest, NextResponse } from "next/server";
import { fetchInstagramMedia, isSupportedInstagramUrl } from "@/lib/instagram";
import type { DownloadResponse } from "@/types";

// Force the Node.js runtime (not Edge) - instagram-url-direct and the
// proxy-rotation logic rely on Node's http/https modules and process.env.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<DownloadResponse>(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const url = (body as { url?: unknown })?.url;

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json<DownloadResponse>(
      { success: false, error: "Please provide a video URL." },
      { status: 400 }
    );
  }

  const trimmedUrl = url.trim();

  if (!isSupportedInstagramUrl(trimmedUrl)) {
    return NextResponse.json<DownloadResponse>(
      {
        success: false,
        error:
          "That doesn't look like a supported Instagram link. Paste a Reel, Post, or IGTV URL."
      },
      { status: 422 }
    );
  }

  try {
    const result = await fetchInstagramMedia(trimmedUrl);
    return NextResponse.json<DownloadResponse>(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong while fetching this video.";

    return NextResponse.json<DownloadResponse>(
      { success: false, error: message },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Use POST with a JSON body of { url }." },
    { status: 405 }
  );
}
