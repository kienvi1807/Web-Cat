import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'img.vietqr.io' },
      { protocol: 'https', hostname: '*.fbcdn.net' },              // 🆕 avatar Facebook
      { protocol: 'https', hostname: 'graph.facebook.com' },       // 🆕 avatar Facebook (fallback graph API)
      { protocol: 'https', hostname: '*.googleusercontent.com' },  // 🆕 avatar Google
    ],
  },
};

export default nextConfig;