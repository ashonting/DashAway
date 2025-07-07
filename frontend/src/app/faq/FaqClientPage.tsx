'use client'



interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FaqClientPage({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="group bg-gray-900/50 rounded-lg p-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-white">
                {faq.question}
                <span className="ml-4 group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-white/80">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
