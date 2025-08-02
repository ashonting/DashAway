import { siteMetadata } from '@/lib/metadata';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Block admin pages
Disallow: /admin
Disallow: /api/
Disallow: /auth/

# Block user-specific pages
Disallow: /dashboard
Disallow: /account

# Allow important pages
Allow: /
Allow: /pricing
Allow: /faq
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /refund-policy

# Sitemap location
Sitemap: ${siteMetadata.url}/sitemap.xml

# Crawl delay (optional, removes aggressive crawling)
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}