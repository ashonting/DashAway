export const siteMetadata = {
  title: 'DashAway - AI Content Humanizer | Remove AI Writing Tells',
  description: 'Transform AI-generated content into natural, human writing. Remove em-dashes, jargon, and AI tells instantly. Make your content undetectable and authentic.',
  url: 'https://dashaway.io',
  siteName: 'DashAway',
  keywords: [
    'AI content humanizer', 'remove AI tells', 'AI writing detector', 'humanize AI text',
    'em-dash remover', 'text cleaning tool', 'AI content editor', 'writing improvement',
    'natural writing', 'authentic content', 'AI detection removal', 'text enhancement',
    'corporate jargon remover', 'writing tool', 'content optimization', 'AI text converter'
  ],
  author: 'DashAway',
  twitterCard: 'summary_large_image' as const,
  ogImage: '/og-image.png',
  favicon: '/favicon.ico',
  themeColor: '#0f172a'
}

export const pageMetadata = {
  home: {
    title: 'DashAway - AI Content Humanizer | Remove AI Writing Tells',
    description: 'Transform AI-generated content into natural, human writing. Remove em-dashes, jargon, and AI tells instantly. Make your content undetectable and authentic.',
    keywords: ['AI content humanizer', 'remove AI tells', 'AI writing detector', 'humanize AI text', 'em-dash remover', 'text cleaning tool']
  },
  dashboard: {
    title: 'Text Analyzer Dashboard | AI Content Humanizer - DashAway',
    description: 'Analyze and humanize your text with DashAway\'s AI content editor. Remove AI tells, em-dashes, and corporate jargon to create natural writing.',
    keywords: ['text analysis', 'AI detection removal', 'writing improvement', 'content dashboard', 'AI humanizer tool']
  },
  pricing: {
    title: 'Pricing Plans | AI Content Humanizer - DashAway',
    description: 'Choose the perfect plan for your AI content humanization needs. Free tier available with Pro features for unlimited text processing.',
    keywords: ['AI humanizer pricing', 'content tool subscription', 'writing tool plans', 'text cleaning service', 'AI content editor pricing']
  },
  account: {
    title: 'Account Settings | Manage Your DashAway Subscription',
    description: 'Manage your DashAway account, subscription, and AI content humanization settings. View usage statistics and billing information.',
    keywords: ['account management', 'subscription settings', 'usage statistics', 'billing', 'profile management']
  },
  login: {
    title: 'Sign In to DashAway | AI Content Humanizer Login',
    description: 'Sign in to your DashAway account to access the AI content humanizer tool. Transform AI writing into natural, human-like content.',
    keywords: ['login', 'sign in', 'AI tool access', 'content humanizer login', 'writing tool authentication']
  },
  register: {
    title: 'Create Account | Start Humanizing AI Content - DashAway',
    description: 'Create your DashAway account and start transforming AI-generated content into natural, human writing. Free tier available.',
    keywords: ['create account', 'sign up', 'AI content tool', 'writing improvement registration', 'humanizer signup']
  },
  faq: {
    title: 'FAQ | How to Use AI Content Humanizer - DashAway',
    description: 'Frequently asked questions about DashAway AI content humanizer. Learn how to remove AI tells and transform your writing.',
    keywords: ['AI humanizer FAQ', 'content tool help', 'writing improvement questions', 'AI detection removal help']
  }
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

