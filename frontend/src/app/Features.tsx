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
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-foreground mb-4">Why Your Content Isn&apos;t Converting</h2>
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                    AI-generated text and corporate jargon destroy trust. Here&apos;s how DashAway fixes the exact problems killing your conversions:
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    title="🤖 Stop the AI Detection" 
                    description="Remove phrases like 'delve into,' 'furthermore,' and 'in conclusion' that scream AI-generated content. Avoid penalties and build trust." 
                />
                <FeatureCard 
                    title="⚡ Cut Reading Time by 40%" 
                    description="Replace jargon like 'utilize' with 'use' and 'facilitate' with 'help.' Complex word simplification and long sentence restructuring coming soon." 
                />
                <FeatureCard 
                    title="💰 Increase Engagement 3x" 
                    description="Eliminate clichés that make readers scroll past. Replace 'game-changer' and 'cutting-edge' with specific, compelling language." 
                />
                <FeatureCard 
                    title="🎯 Convert More Leads" 
                    description="Professional writing that doesn't sound corporate builds trust. Turn more visitors into customers with authentic voice." 
                />
                <FeatureCard 
                    title="⏱️ Save 2+ Hours Per Article" 
                    description="Stop manually hunting for weak phrases. Get instant feedback and suggestions that make every sentence stronger." 
                />
                <FeatureCard 
                    title="🔒 100% Private & Secure" 
                    description="Your content never leaves your browser. No data storage, no AI training, no privacy concerns. Your words stay yours." 
                />
            </div>
        </section>
    );
}
