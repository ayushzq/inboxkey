import type { DownloadResult, MediaItem, MediaType } from "@/types";

// Sirf valid Instagram URLs ko check karne ke liye pattern
const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_\-.]+/i;

export function isSupportedInstagramUrl(url: string): boolean {
  return INSTAGRAM_URL_PATTERN.test(url.trim());
}

/**
 * Ab yeh function free third-party open-source API ka use karke video nikalega.
 * Koi proxy ya heavy libraries ki zaroorat nahi.
 */
export async function fetchInstagramMedia(url: string): Promise<DownloadResult> {
  try {
    // Cobalt API call - Bina kisi proxy/key ke free video download
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url
      })
    });

    if (!response.ok) {
      throw new Error(`API ne request block kar di (Status: ${response.status}).`);
    }

    const data = await response.json();

    // API agar error bheje (jaise private account ya link expire)
    if (data.status === "error" || data.status === "rate-limit") {
      throw new Error(data.text || "Is link se video nikalne mein problem aayi.");
    }

    let items: MediaItem[] = [];
    let mediaType: MediaType = "video";

    // Agar post mein ek se zyada photos/videos hain (Carousel)
    if (data.picker && Array.isArray(data.picker)) {
      mediaType = "carousel";
      items = data.picker.map((item: any) => ({
        type: item.type === "photo" ? "image" : "video",
        downloadUrl: item.url,
        thumbnail: item.thumb || ""
      }));
    } 
    // Agar single video ya reel hai
    else if (data.url) {
      items = [{
        type: "video",
        downloadUrl: data.url,
        thumbnail: ""
      }];
    } else {
      throw new Error("Is link par koi valid media file nahi mili.");
    }

    return {
      success: true,
      sourceUrl: url,
      title: "Instagram Downloader", // Simple title
      caption: "",
      username: "",
      thumbnail: items[0]?.thumbnail || "",
      mediaType: mediaType,
      items: items
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`API Scraping fail: ${message}`);
  }
}
