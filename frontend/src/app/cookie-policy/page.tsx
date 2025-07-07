import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - DashAway',
  description: 'Information about how DashAway uses cookies.',
}

export default function CookiePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80 space-y-4">
          <p>Last updated: July 2025</p>
          <p>DashAway uses cookies and similar technologies to improve your experience and analyze usage.</p>

          <h2 className="text-xl font-semibold text-white pt-4">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device to enhance website functionality.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">2. How We Use Cookies</h2>
          <ul>
            <li>To remember your preferences and settings.</li>
            <li>To analyze usage and improve our Service.</li>
            <li>For authentication and security purposes.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">3. Managing Cookies</h2>
          <p>
            You can manage or disable cookies through your browser settings. Disabling cookies may affect
            functionality.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">4. Contact</h2>
          <p>
            Questions about this policy? Email support@dashaway.io.
          </p>
        </div>
      </div>
    </div>
  )
}
