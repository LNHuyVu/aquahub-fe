import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aquahub.vn';

  // Static routes
  const routes = [
    '',
    '/ca-canh',
    '/san-mua-ban',
    '/cam-nang',
    '/cong-dong',
    '/hoi-dap',
    '/ho-ca',
    '/cong-cu',
    '/lien-he',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
