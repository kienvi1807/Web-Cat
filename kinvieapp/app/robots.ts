import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api'] },
    sitemap: 'https://<domain-của-mày>.com/sitemap.xml',
  };
}