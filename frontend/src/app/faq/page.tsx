import type { Metadata } from 'next'
import FaqClientPage from './FaqClientPage'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - DashAway',
  description: 'Find answers to common questions about DashAway.',
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

async function getFaqs(): Promise<FAQ[]> {
  const res = await fetch('http://localhost:8000/faq', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch FAQs');
  }
  return res.json();
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  return <FaqClientPage faqs={faqs} />
}
