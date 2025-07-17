'use client';

const FeatureCard = ({ title, description }: { title: string, description: string }) => (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-white/70 mt-2">{description}</p>
    </div>
);

export default function Features() {
    return (
        <section className="py-20">
            <h2 className="text-4xl font-bold text-text text-center mb-12">A Better Way to Write</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard title="Improve Readability" description="Make your writing easy to understand for any audience." />
                <FeatureCard title="Sound More Professional" description="Eliminate common mistakes that undermine your credibility." />
                <FeatureCard title="Eliminate AI Tells" description="Refine AI-generated text to sound more human and authentic." />
                <FeatureCard title="Save Time" description="Automate the tedious process of proofreading for common issues." />
                <FeatureCard title="Learn as You Go" description="Our suggestions help you become a better writer over time." />
                <FeatureCard title="Secure and Private" description="Your text is never stored or used to train our models." />
            </div>
        </section>
    );
}
