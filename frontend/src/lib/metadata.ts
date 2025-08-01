export const siteMetadata = {
  title: 'DashAway - Remove AI Tells from Your Writing',
  description: 'Transform AI-generated content into natural, human writing. Remove em-dashes, jargon, and AI tells instantly.',
  url: 'https://dashaway.io',
  siteName: 'DashAway',
  keywords: ['AI content', 'writing tool', 'remove AI tells', 'em-dash remover', 'text cleaning'],
  author: 'DashAway',
  twitterCard: 'summary_large_image' as const,
  ogImage: '/og-image.png'
}

export const pageMetadata = {
  home: {
    title: 'DashAway - Remove AI Tells from Your Writing',
    description: 'Transform AI-generated content into natural, human writing. Remove em-dashes, jargon, and AI tells instantly.',
    keywords: ['AI content', 'writing tool', 'remove AI tells', 'em-dash remover', 'text cleaning']
  },
  dashboard: {
    title: 'Dashboard | DashAway',
    description: 'Analyze and clean your text with DashAway. Remove AI tells, em-dashes, and corporate jargon.',
    keywords: ['text analysis', 'AI detection', 'writing improvement', 'dashboard']
  },
  pricing: {
    title: 'Pricing | DashAway',
    description: 'Choose the perfect plan for your writing needs. Free tier available.',
    keywords: ['pricing', 'subscription', 'plans', 'text cleaning service']
  },
  account: {
    title: 'Account | DashAway',
    description: 'Manage your DashAway account and subscription.',
    keywords: ['account', 'profile', 'subscription management']
  },
  login: {
    title: 'Login | DashAway',
    description: 'Sign in to your DashAway account.',
    keywords: ['login', 'sign in', 'authentication']
  },
  register: {
    title: 'Register | DashAway',
    description: 'Create your DashAway account and start improving your writing.',
    keywords: ['register', 'sign up', 'create account']
  },
  faq: {
    title: 'FAQ | DashAway',
    description: 'Frequently asked questions about DashAway text cleaning service.',
    keywords: ['FAQ', 'help', 'questions', 'support']
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

