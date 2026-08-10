import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = [".cdninstagram.com", ".fbcdn.net", "instagram.com"];

function isAllowedHost(rawUrl: string): boolean {
  try {
    const { hostname } = new URL(rawUrl);
    return ALLOWED_HOSTS.some((h) => hostname.endsWith(h));
  } catch {
    return false;
  }
}

/**
 * Streams the direct media URL back to the browser with a
 * Content-Disposition header, so the "Download" button always saves an
 * .mp4 / .jpg file instead of opening the raw CDN link in a new tab.
 */
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename") || "video.mp4";

  if (!target || !isAllowedHost(target)) {
    return NextResponse.json(
      { success: false, error: "Invalid or unsupported media URL." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(target);

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, error: "The media could not be fetched from Instagram." },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "video/mp4";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Download failed. Please try again." },
      { status: 502 }
    );
  }
}
