import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - DashAway',
  description: 'How DashAway handles your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80 space-y-4">
          <p>Last updated: July 2025</p>
          <p>
            DashAway (“we”, “us”, or “our”) respects your privacy and is committed to protecting your
            personal information. This Privacy Policy explains how we collect, use, and safeguard your
            information when you use our website and services.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">1. Information We Collect</h2>
          <ul>
            <li>Personal information you provide, such as name, email, and payment details.</li>
            <li>Usage data, including IP address, browser type, and access times.</li>
            <li>Cookies and similar tracking technologies.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">2. Use of Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, operate, and maintain our Service.</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Communicate with you about your account and updates.</li>
            <li>Analyze usage and improve our Service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">3. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share information with:
          </p>
          <ul>
            <li>Service providers who assist in operating our Service.</li>
            <li>Authorities if required by law.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">4. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information. However, no system is
            100% secure.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. Contact us at
            support@dashaway.io to make a request.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">6. Children’s Privacy</h2>
          <p>
            Our Service is not intended for individuals under 18. We do not knowingly collect information
            from children.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact support@dashaway.io.
          </p>
        </div>
      </div>
    </div>
  )
}