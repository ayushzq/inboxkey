import type { DownloadResult, MediaItem, MediaType } from "@/types";

const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_\-.]+/i;

export function isSupportedInstagramUrl(url: string): boolean {
  return INSTAGRAM_URL_PATTERN.test(url.trim());
}

export async function fetchInstagramMedia(url: string): Promise<DownloadResult> {
  // Vercel se tumhari RapidAPI key yahan aayegi
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error("RapidAPI Key missing hai! Vercel environment variables me RAPIDAPI_KEY set karein.");
  }

  try {
    // Tumhari select ki hui API ka Host aur Endpoint
    const rapidApiHost = "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com";
    const endpoint = `https://${rapidApiHost}/convert?url=${encodeURIComponent(url)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-rapidapi-host": rapidApiHost,
        "x-rapidapi-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.message || response.statusText}`);
    }

    let items: MediaItem[] = [];
    let mediaType: MediaType = "video";

    // Data nikalne ka logic
    const mediaData = data.data || data; 
    const mediaList = Array.isArray(mediaData) ? mediaData : [mediaData];

    // FIX: TypeScript ko strict type batane ke liye yahan `: MediaItem` add kiya hai
    items = mediaList.map((m: any): MediaItem => ({
      type: (m.type === "image" || m.is_video === false) ? "image" : "video",
      downloadUrl: m.video_url || m.download_url || m.url || m.link || "",
      thumbnail: m.thumbnail || m.cover || ""
    })).filter(i => i.downloadUrl); // Khaali URLs hata do

    if (items.length === 0) {
      throw new Error(`Media link nahi mila. API Response badal gaya hai.`);
    }

    mediaType = items.length > 1 ? "carousel" : items[0].type;

    return {
      success: true,
      sourceUrl: url,
      title: data.title || "Instagram Media",
      caption: data.caption || "",
      username: data.username || data.author || "",
      thumbnail: items[0]?.thumbnail || "",
      mediaType: mediaType,
      items: items
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`RapidAPI Scraping fail: ${message}`);
  }
}
