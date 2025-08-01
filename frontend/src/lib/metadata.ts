export const siteMetadata = {
  title: 'DashAway - Remove AI Tells from Your Writing',
  description: 'Transform AI-generated content into natural, human writing. Remove em-dashes, jargon, and AI tells instantly.',
  url: 'https://dashaway.io',
  siteName: 'DashAway',
  keywords: 'AI content, writing tool, remove AI tells, em-dash remover, text cleaning',
  author: 'DashAway',
  twitterCard: 'summary_large_image',
  ogImage: '/og-image.png'
}

export function getPageMetadata(pageTitle?: string, pageDescription?: string) {
  const title = pageTitle ? `${pageTitle} | ${siteMetadata.siteName}` : siteMetadata.title
  const description = pageDescription || siteMetadata.description
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteMetadata.url,
      siteName: siteMetadata.siteName,
      type: 'website',
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title,
      description,
    }
  }
}