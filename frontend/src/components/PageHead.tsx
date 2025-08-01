'use client';

import { useEffect } from 'react';
import { pageMetadata, siteMetadata } from '@/lib/metadata';

interface PageHeadProps {
  page: keyof typeof pageMetadata;
}

export default function PageHead({ page }: PageHeadProps) {
  useEffect(() => {
    const meta = pageMetadata[page];
    
    // Update title
    document.title = meta.title;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', meta.description);
    }
    
    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', meta.keywords.join(', '));
    }
    
    // Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      const url = page === 'home' ? siteMetadata.url : `${siteMetadata.url}/${page}`;
      ogUrl.setAttribute('content', url);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', meta.title);
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', meta.description);
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const url = page === 'home' ? siteMetadata.url : `${siteMetadata.url}/${page}`;
      canonical.setAttribute('href', url);
    }
  }, [page]);

  return null;
}