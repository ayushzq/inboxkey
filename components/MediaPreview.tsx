"use client";

import { Download, User, Film, Image as ImageIcon, Layers } from "lucide-react";
import type { DownloadResult } from "@/types";

const typeMeta = {
  video: { label: "Video", icon: Film },
  image: { label: "Photo", icon: ImageIcon },
  carousel: { label: "Carousel", icon: Layers }
};

function buildProxyDownloadHref(url: string, filename: string) {
  const params = new URLSearchParams({ url, filename });
  return `/api/proxy-download?${params.toString()}`;
}

export default function MediaPreview({ result }: { result: DownloadResult }) {
  const Meta = typeMeta[result.mediaType];

  return (
    <div className="glass-panel w-full p-5 sm:p-6 animate-rise">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative w-full sm:w-40 aspect-[4/5] sm:aspect-square shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10">
          {result.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.thumbnail}
              alt={result.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <Meta.icon size={28} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <div>
            <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-ink-muted">
              <Meta.icon size={13} />
              {Meta.label}
              {result.items.length > 1 ? ` - ${result.items.length} files` : ""}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug text-ink line-clamp-2">
            {result.title}
          </h3>

          {result.caption && result.caption !== result.title ? (
            <p className="text-sm text-ink-muted line-clamp-2">{result.caption}</p>
          ) : null}

          {result.username ? (
            <div className="flex items-center gap-1.5 text-sm text-ink-muted">
              <User size={14} />
              <span>@{result.username}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {result.items.map((item, index) => {
          const filename = `glassreel-${index + 1}.${item.type === "image" ? "jpg" : "mp4"}`;
          return (
            <a
              key={`${item.downloadUrl}-${index}`}
              href={buildProxyDownloadHref(item.downloadUrl, filename)}
              className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-spectrum-violet via-spectrum-cyan to-spectrum-magenta px-5 py-3 font-medium text-void-deep shadow-glass transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />
              {result.items.length > 1
                ? `Download file ${index + 1} (${item.type === "image" ? "JPG" : "MP4"})`
                : `Download ${item.type === "image" ? "JPG" : "MP4"}`}
            </a>
          );
        })}
      </div>
    </div>
  );
}
