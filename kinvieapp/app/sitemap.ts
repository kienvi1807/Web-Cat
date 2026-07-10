import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://<domain-của-mày>.com';
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/cattery`, priority: 0.8 },
    { url: `${base}/petshop`, priority: 0.8 },
    { url: `${base}/memorial`, priority: 0.6 },
    { url: `${base}/blog`, priority: 0.6 },
  ];
}