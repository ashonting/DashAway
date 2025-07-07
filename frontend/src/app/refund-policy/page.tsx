import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - DashAway',
  description: 'DashAway\'s policy on refunds and cancellations.',
}

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Refund Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80 space-y-4">
          <p>Last updated: July 2025</p>
          <p>DashAway strives for customer satisfaction. Please read our refund policy carefully.</p>

          <h2 className="text-xl font-semibold text-white pt-4">1. Subscription Refunds</h2>
          <p>
            We offer a 7-day money-back guarantee for first-time subscribers. To request a refund within
            this period, contact support@dashaway.io with your account details.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">2. Renewal Refunds</h2>
          <p>
            Renewals and recurring subscription charges are non-refundable. Please cancel your subscription
            before the next billing cycle to avoid further charges.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">3. Exceptional Circumstances</h2>
          <p>
            Refund requests outside of the 7-day window will be considered on a case-by-case basis at our
            sole discretion.
          </p>

          <h2 className="text-xl font-semibold text-white pt-4">4. How to Request a Refund</h2>
          <p>
            Email support@dashaway.io with your account email and order details. Refunds will be processed
            to the original payment method within 5–10 business days after approval.
          </p>
        </div>
      </div>
    </div>
  )
}