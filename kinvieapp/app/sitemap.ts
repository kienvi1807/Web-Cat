import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://kinvieapp.vercel.app';
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/cattery`, priority: 0.8 },
    { url: `${base}/petshop`, priority: 0.8 },
    { url: `${base}/memorial`, priority: 0.6 },
    { url: `${base}/blog`, priority: 0.6 },
  ];
}