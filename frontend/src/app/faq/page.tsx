'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Star, Zap, Shield, FileText } from 'lucide-react';
import PageHead from '@/components/PageHead';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'pricing' | 'technical' | 'account';
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    id: 'what-is-dashaway',
    category: 'getting-started',
    question: 'What is DashAway and how does it work?',
    answer: 'DashAway transforms AI-generated content from ChatGPT, Claude, and other AI tools into authentic human writing. We remove em-dashes (the biggest AI tell), robotic phrases, and corporate jargon that make content sound artificial. Simply paste your AI-generated text, click &quot;Humanize AI Content,&quot; and get back content that\u2019s completely undetectable as AI-written.'
  },
  {
    id: 'how-to-use',
    category: 'getting-started',
    question: 'How do I use DashAway?',
    answer: '1. Paste or type your text in the left panel\n2. Click &quot;Clean Text Now&quot; to analyze\n3. Review highlighted issues in different colors\n4. Click on any highlighted text to see suggestions\n5. Accept suggestions or use &quot;Replace All&quot; for bulk changes\n6. Export your cleaned text as TXT or DOCX'
  },
  {
    id: 'what-issues-detected',
    category: 'getting-started',
    question: 'What AI tells does DashAway detect and remove?',
    answer: 'DashAway identifies the biggest AI giveaways:\n• **Em-dashes (—)** - The #1 AI tell. ChatGPT and Claude overuse these\n• **Robotic phrases** - &quot;Furthermore,&quot; &quot;delve into,&quot; &quot;in conclusion&quot;\n• **Corporate jargon** - &quot;leverage,&quot; &quot;utilize,&quot; &quot;synergize&quot;\n• **AI fingerprints** - Patterns specific to GPT models\n\nEach issue is highlighted in different colors and clickable for instant fixes. Your content will pass all AI detectors after cleaning.'
  },

  // Features
  {
    id: 'grade-level-scoring',
    category: 'features', 
    question: 'How does the Grade Level scoring work?',
    answer: 'We use the Flesch-Kincaid Grade Level formula, which calculates readability based on sentence length and syllable count. The score represents the U.S. grade level needed to understand the text. For example:\n• Score 8.0 = 8th grade reading level\n• Score 12.0 = 12th grade (high school senior)\n• Score 16.0+ = College graduate level\n\nLower scores mean easier reading. We calculate this on cleaned text for accuracy.'
  },
  {
    id: 'character-limits',
    category: 'features',
    question: 'What are the character limits for different plans?',
    answer: 'Character limits vary by plan:\n• Anonymous users: 1 free try with standard limits\n• Free account: 10,000 characters per text, 2 uses per month\n• Pro users: 500,000 characters per text, unlimited usage\n\nPro users also get document history, export features, and priority support.'
  },
  {
    id: 'document-history',
    category: 'features',
    question: 'How does document history work?',
    answer: 'Pro and Basic users can access their document history through the Dashboard. We save:\n• Original text and cleaned versions\n• Processing date and time\n• Quick preview for easy identification\n• Full document details when clicked\n\nYou can view, download, or delete any saved document. Anonymous users don&apos;t get history saved.'
  },

  // Pricing
  {
    id: 'pricing-plans',
    category: 'pricing',
    question: 'What are the different pricing plans?',
    answer: 'We offer three tiers:\n\n**Anonymous**: 1 free try, no account needed\n\n**Basic (Free Account)**:\n• 2 cleanings per month\n• Document history\n• Basic grade level scoring\n• Email support\n\n**Pro ($4/month)**:\n• Unlimited cleanings\n• 500K character limit\n• Advanced metrics\n• Priority support\n• Export features\n• No usage restrictions'
  },
  {
    id: 'free-vs-pro',
    category: 'pricing',
    question: 'What&apos;s the difference between Basic and Pro?',
    answer: 'Basic users get 2 monthly cleanings with 10K character limits, while Pro users get unlimited cleanings with 500K character limits. Pro also includes:\n• Document export (TXT/DOCX)\n• Advanced grade level metrics\n• Priority email support\n• Planned features: complex word simplification, sentence restructuring\n• No usage restrictions or waiting periods'
  },
  {
    id: 'upgrade-anytime',
    category: 'pricing',
    question: 'Can I upgrade or cancel anytime?',
    answer: 'Yes! You can upgrade from Basic to Pro anytime from your Dashboard. Pro subscriptions can be cancelled anytime - you&apos;ll retain Pro features until the end of your current billing period, then automatically revert to Basic with 2 monthly cleanings.'
  },

  // Technical
  {
    id: 'accuracy',
    category: 'technical',
    question: 'How accurate is DashAway&apos;s text analysis?',
    answer: 'Our analysis engine uses carefully curated databases of:\n• 1000+ common clichés with context-aware detection\n• 500+ corporate jargon terms with alternatives\n• AI tell patterns based on GPT/LLM output analysis\n• Advanced em-dash detection with grammar rules\n\nWe continuously update these databases and use context-aware matching to minimize false positives while catching real issues.'
  },
  {
    id: 'data-privacy',
    category: 'technical',
    question: 'Is my text data secure and private?',
    answer: 'Yes, we take privacy seriously:\n• Text processing happens on secure servers\n• We don&apos;t store anonymous user text\n• Registered user documents are encrypted\n• No text data is used for training or shared with third parties\n• You can delete your document history anytime\n• We comply with GDPR and data protection standards'
  },
  {
    id: 'supported-languages',
    category: 'technical',
    question: 'What languages does DashAway support?',
    answer: 'Currently, DashAway is optimized for English text analysis. Our cliché, jargon, and AI tell databases are English-focused, and the Flesch-Kincaid grade level calculation is designed for English. We&apos;re exploring multi-language support for future releases.'
  },

  // Account
  {
    id: 'create-account',
    category: 'account',
    question: 'How do I create an account?',
    answer: 'You can create an account in two ways:\n• Click &quot;Register&quot; and sign up with email/password\n• Use &quot;Sign in with Google&quot; for quick OAuth registration\n\nBoth methods give you the same Basic plan with 2 monthly cleanings and document history. No credit card required for Basic accounts.'
  },
  {
    id: 'forgot-password',
    category: 'account', 
    question: 'I forgot my password. How do I reset it?',
    answer: 'On the login page:\n1. Enter your email address\n2. Click &quot;Forgot your password?&quot;\n3. Check your email for a password reset link\n4. Follow the link to set a new password\n5. Sign in with your new password\n\nIf you originally signed up with Google, use &quot;Sign in with Google&quot; instead.'
  },
  {
    id: 'delete-account',
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'To delete your account:\n1. Sign in to your Dashboard\n2. Go to Account Settings\n3. Click &quot;Delete Account&quot;\n4. Confirm deletion\n\nThis permanently removes all your data, document history, and subscription. This action cannot be undone. For Pro users, we recommend canceling your subscription first.'
  }
];

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: HelpCircle, color: 'text-blue-500' },
  { id: 'features', name: 'Features', icon: Zap, color: 'text-purple-500' },
  { id: 'pricing', name: 'Pricing', icon: Star, color: 'text-yellow-500' },
  { id: 'technical', name: 'Technical', icon: Shield, color: 'text-green-500' },
  { id: 'account', name: 'Account', icon: FileText, color: 'text-red-500' }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFaqs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  return (
    <>
      <PageHead page="faq" />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent mb-4">
              They&apos;ll Never Know AI Wrote It - FAQ
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about making your AI content undetectable and authentically human.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Questions
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${category.color}`} />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const category = categories.find(cat => cat.id === faq.category);
              const Icon = category?.icon || HelpCircle;
              
              return (
                <div
                  key={faq.id}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${category?.color || 'text-gray-400'}`} />
                      <span className="font-semibold text-white text-lg">{faq.question}</span>
                    </div>
                    {openItems.has(faq.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {openItems.has(faq.id) && (
                    <div className="px-6 pb-4 border-t border-white/5">
                      <div className="pt-4 text-gray-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-teal-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
              <p className="text-gray-300 mb-6">
                Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@dashaway.io"
                  className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="/contact"
                  className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Contact Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}