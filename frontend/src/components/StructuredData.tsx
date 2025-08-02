'use client';

import { siteMetadata } from '@/lib/metadata';

interface StructuredDataProps {
  type: 'website' | 'product' | 'article' | 'organization' | 'faq';
  data?: any;
}

export default function StructuredData({ type, data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      url: siteMetadata.url,
      name: siteMetadata.siteName,
      description: siteMetadata.description,
    };

    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          ...baseData,
          url: siteMetadata.url,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteMetadata.url}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteMetadata.siteName,
          url: siteMetadata.url,
          description: siteMetadata.description,
          logo: {
            '@type': 'ImageObject',
            url: `${siteMetadata.url}/logo.png`,
            width: 512,
            height: 512
          },
          sameAs: [
            // Add social media URLs when available
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: `${siteMetadata.url}/contact`
          }
        };

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'DashAway AI Content Humanizer',
          description: 'AI content humanization tool that removes AI tells and transforms AI-generated text into natural, human writing.',
          url: siteMetadata.url,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier available with Pro subscription options',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
            worstRating: '1'
          },
          featureList: [
            'Remove AI writing tells',
            'Eliminate excessive em-dashes',
            'Remove corporate jargon',
            'Text readability analysis',
            'Real-time content optimization',
            'Batch text processing'
          ]
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title || siteMetadata.title,
          description: data.description || siteMetadata.description,
          url: data.url || siteMetadata.url,
          datePublished: data.datePublished || new Date().toISOString(),
          dateModified: data.dateModified || new Date().toISOString(),
          author: {
            '@type': 'Organization',
            name: siteMetadata.siteName,
            url: siteMetadata.url
          },
          publisher: {
            '@type': 'Organization',
            name: siteMetadata.siteName,
            url: siteMetadata.url,
            logo: {
              '@type': 'ImageObject',
              url: `${siteMetadata.url}/logo.png`
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url || siteMetadata.url
          }
        };

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.questions?.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer
            }
          })) || []
        };

      default:
        return baseData;
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// Common structured data configurations
export const WebsiteStructuredData = () => <StructuredData type="website" />;
export const OrganizationStructuredData = () => <StructuredData type="organization" />;
export const ProductStructuredData = () => <StructuredData type="product" />;

// HOC for pages that need article structured data
export const withArticleStructuredData = (
  Component: React.ComponentType<any>,
  articleData: any
) => {
  return function ArticleWithStructuredData(props: any) {
    return (
      <>
        <StructuredData type="article" data={articleData} />
        <Component {...props} />
      </>
    );
  };
};