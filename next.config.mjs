/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return Date.now().toString();
  },
  env: {
    BUILD_ID: Date.now().toString(),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "pub-52a29c3c256446bcb8fcb5dbee9ba062.r2.dev",
      },
    ],
    unoptimized: false,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    {
      // Cache static assets aggressively (JS, CSS, fonts, images)
      source: "/:path*.(js|css|woff|woff2|ttf|eot|ico|svg|png|jpg|jpeg|webp|avif)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache public pages for 1 hour, revalidate in background
      source: "/(|blog|tarifs|contactez-nous|book|conditions)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      ],
    },
  ],
};

export default nextConfig;
