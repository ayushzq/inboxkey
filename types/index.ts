export type MediaType = "video" | "image" | "carousel";

export interface MediaItem {
  type: "video" | "image";
  downloadUrl: string;
  thumbnail?: string;
}

export interface DownloadResult {
  success: true;
  sourceUrl: string;
  title: string;
  caption: string;
  username: string;
  thumbnail: string;
  mediaType: MediaType;
  items: MediaItem[];
}

export interface DownloadErrorResponse {
  success: false;
  error: string;
}

export type DownloadResponse = DownloadResult | DownloadErrorResponse;
