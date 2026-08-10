/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Instagram CDN thumbnails come from many rotating hostnames
    // (scontent-*.cdninstagram.com, instagram.f*.fna.fbcdn.net, etc.)
    // so we allow the pattern broadly instead of listing hosts one by one.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "instagram.com" },
      { protocol: "https", hostname: "**.instagram.com" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["instagram-url-direct", "global-agent"]
  }
};

module.exports = nextConfig;
