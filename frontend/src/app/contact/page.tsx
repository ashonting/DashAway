export default function Contact() {
    return (
        <main className="container mx-auto px-4 py-8 text-center bg-background text-text">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
                <div className="space-y-4">
                    <p>If you have any questions, feedback, or need support, please don&apos;t hesitate to reach out.</p>
                    <p>You can contact us by email at:</p>
                    <a href="mailto:support@dashaway.io" className="text-2xl text-primary font-bold hover:underline">
                        support@dashaway.io
                    </a>
                </div>
            </div>
        </main>
    );
}
