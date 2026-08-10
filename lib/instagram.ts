import type { DownloadResult, MediaItem, MediaType } from "@/types";

const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_\-.]+/i;

export function isSupportedInstagramUrl(url: string): boolean {
  return INSTAGRAM_URL_PATTERN.test(url.trim());
}

export async function fetchInstagramMedia(url: string): Promise<DownloadResult> {
  // Ab Vercel se tumhara naya Apify Token aayega
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    throw new Error("Apify API Token missing hai! Vercel me APIFY_API_TOKEN set karein.");
  }

  try {
    // Apify ka direct endpoint jo 'apify/instagram-scraper' bot ko run karega
    // aur wait karega jab tak data (dataset items) mil na jaye
    const endpoint = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apiToken}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Apify bot ko hum JSON format mein URL bhej rahe hain
      body: JSON.stringify({
        directUrls: [url],
        resultsType: "details"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify Server Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Apify result hamesha ek array (list) mein bhejta hai
    if (!data || data.length === 0) {
      throw new Error("Link se koi data nahi mila. Yeh video shayad private hai.");
    }

    const postData = data[0]; // Humara scraped data pehle number par hoga
    let items: MediaItem[] = [];
    let mediaType: MediaType = "video";

    // Agar post mein multiple photos/videos hain (Carousel)
    if (postData.childPosts && Array.isArray(postData.childPosts) && postData.childPosts.length > 0) {
      mediaType = "carousel";
      items = postData.childPosts.map((m: any): MediaItem => ({
        type: (m.type === "Video" || m.videoUrl) ? "video" : "image",
        downloadUrl: m.videoUrl || m.displayUrl || "",
        thumbnail: m.displayUrl || ""
      })).filter((i: MediaItem) => i.downloadUrl); // YAHAN TYPE FIX KIYA HAI
    } 
    // Agar single Reel, Video ya Image hai
    else {
      const isVideo = postData.type === "Video" || postData.videoUrl;
      mediaType = isVideo ? "video" : "image";
      items = [{
        type: isVideo ? "video" : "image",
        downloadUrl: postData.videoUrl || postData.displayUrl || "",
        thumbnail: postData.displayUrl || ""
      }];
    }

    if (items.length === 0 || !items[0].downloadUrl) {
      throw new Error("Media link extract karne mein problem aayi.");
    }

    return {
      success: true,
      sourceUrl: url,
      title: postData.caption ? postData.caption.substring(0, 40) + "..." : "Instagram Download",
      caption: postData.caption || "",
      username: postData.ownerUsername || postData.ownerFullName || "",
      thumbnail: items[0]?.thumbnail || "",
      mediaType: mediaType,
      items: items
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Apify Scraping fail: ${message}`);
  }
}
