'use client';
import { useState, useEffect } from 'react';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('http://localhost:8000/faq');
                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }
                const data = await response.json();
                setFaqs(data);
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    return (
        <main className="container mx-auto px-4 py-8 bg-background text-text">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <div className="space-y-6">
                    {faqs.map((faq) => (
                        <div key={faq.id}>
                            <h2 className="text-xl font-bold text-primary">{faq.question}</h2>
                            <p className="mt-2 text-text/90">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
