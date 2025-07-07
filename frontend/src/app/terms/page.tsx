import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - DashAway',
  description: 'The terms and conditions for using the DashAway service.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-white/80 space-y-4">
          <p>Last updated: July 2025</p>
          <p>Welcome to DashAway!</p>
          <p>
            These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) govern your access to and use of the DashAway
            website and services (the &quot;Service&quot;) provided by DashAway. By accessing or using the Service,
            you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">1. Use of Service</h2>
          <p>
            You must be at least 18 years old to use DashAway. You agree to use the Service only for lawful
            purposes and in compliance with all applicable laws.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">2. Account Registration</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to
            notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">3. Intellectual Property</h2>
          <p>
            All content and materials available on DashAway, including but not limited to text, graphics,
            logos, and software, are the property of DashAway or its licensors and are protected by
            intellectual property laws.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">4. User Content</h2>
          <p>
            You retain ownership of any content you submit to the Service. By submitting content, you grant
            DashAway a worldwide, non-exclusive, royalty-free license to use, display, and reproduce such
            content solely for the purpose of operating the Service.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful or fraudulent activity.</li>
            <li>Attempt to gain unauthorized access to any part of the Service.</li>
            <li>Reverse engineer or attempt to extract the source code of the Service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white pt-4">6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service at our discretion,
            without notice, if you violate these Terms.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">7. Disclaimer</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the
            Service will be uninterrupted or error-free.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, DashAway shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">9. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Your continued use of the Service after changes
            are posted constitutes your acceptance of the revised Terms.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">10. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@dashaway.io.
          </p>
        </div>
      </div>
    </div>
  )
}