import re
import json
from ai_tells import AI_TELLS
from ai_tell_suggestions import AI_TELL_SUGGESTIONS
from cliches import CLICHES
from cliche_suggestions import CLICHE_SUGGESTIONS
from jargon import JARGON
from jargon_suggestions import JARGON_SUGGESTIONS

text = """Unlocking Scalable Synergy: How Hyperautomation Is Revolutionizing the Digital Landscape
In the ever-evolving landscape of digital transformation—where agility, velocity, and scalability reign supreme—businesses are being forced to reimagine traditional workflows. And while the buzzwords may seem endless—hyperautomation, intelligent orchestration, seamless integration—the reality is clear: organizations that fail to embrace this paradigm shift are at risk of being left behind.

At the heart of this transformation lies a simple truth—manual processes are no longer sustainable in a world driven by data. As we stand at the intersection of innovation and inevitability, it's critical to explore how hyperautomation—defined as the orchestrated use of AI, machine learning, robotic process automation (RPA), and low-code tools—is redefining operational excellence.

The Synergy of Intelligent Systems—Why Now Matters
To fully understand the gravity of this moment, we must zoom out—examining not just the tools themselves, but the converging forces that make their adoption imperative. Cloud-native infrastructure, democratized AI, and real-time analytics have collectively lowered the barrier to entry—ushering in an era where even small-to-medium enterprises can leverage enterprise-grade capabilities.

But let’s not oversimplify. The integration of disparate technologies—often across legacy systems and fragmented data lakes—is a non-trivial challenge. Yet the potential rewards—efficiency gains, cost reductions, and experience personalization—make it a game-changer in every sense of the word.

It is important to note that while many organizations claim to be “AI-powered,” true transformation goes beyond surface-level automation—it requires cultural alignment, executive buy-in, and a roadmap that balances ambition with pragmatism.

Low-Code, No-Code—And the Democratization of Development
Once upon a time, digital innovation was the domain of senior developers and DevOps architects. Today, that barrier has been dramatically lowered—thanks in large part to the explosion of low-code and no-code platforms.

These platforms—equipped with drag-and-drop interfaces, pre-built integrations, and AI-driven logic modules—have empowered “citizen developers” to bring ideas to life without writing a single line of code. It’s a seismic shift—removing the bottleneck of technical gatekeeping and accelerating time-to-value.

At the end of the day, the organizations that thrive will be those who empower their frontline teams—turning ideas into executable workflows with unprecedented speed.

AI + RPA = Hyperautomation—More Than the Sum of Its Parts
Robotic Process Automation was once considered the final frontier of back-office efficiency. But combine it with AI—and you get something far more powerful: systems that don’t just automate, but think.

Think document processing pipelines that:

Ingest thousands of PDFs per hour

Extract relevant data using OCR and NLP

Decide how to route that information based on contextual understanding

The result? Autonomous workflows that mimic—and sometimes outperform—human decision-making.

Make no mistake—this is not a simple plug-and-play scenario. Success depends on training quality, feedback loops, exception handling protocols, and ethical guardrails. But when done right—the business impact is nothing short of transformative.

Data Is the New Oil—But Only If Refined
You’ve heard it before—“data is the new oil.” But raw data—like crude—has little value unless refined, structured, and contextualized. This is where AI excels—applying advanced analytics, pattern recognition, and predictive modeling to transform information into insight.

However, it's worth noting that without data governance frameworks—ensuring compliance, lineage, and quality control—these models are prone to drift, hallucination, and bias.

In a world where GDPR, HIPAA, and SOC2 compliance are table stakes—responsible AI isn’t just good ethics—it’s good business.

The Feedback Loop—Continuous Learning at Scale
In machine learning, no system is ever truly “done.” Continuous learning—the feedback loop between input, output, and retraining—is what allows algorithms to evolve. This concept—borrowed from human cognition—has been industrialized.

Consider a customer service chatbot:

Day 1: It uses a base LLM to answer FAQs

Day 30: It has fine-tuned its model using embeddings from actual user queries

Day 90: It routes edge cases to human agents and reabsorbs their resolutions

Over time—it doesn’t just get better. It gets contextually aware.

This is how AI systems graduate from reactive scripts to proactive advisors. And this capability—scalable intelligence via feedback loops—is the key to hyperautomation’s long-term viability.

Use Cases That Illustrate the Paradigm Shift
Hyperautomation isn’t just a theoretical construct—it’s happening right now across industries.

Healthcare: Automated prior authorization requests—reducing processing time from days to minutes.

Finance: AI-enhanced fraud detection—identifying anomalies across billions of transactions in real time.

Retail: Dynamic pricing engines—adjusting SKUs based on demand elasticity and competitor signals.

Logistics: Predictive maintenance models—alerting operators before assets fail.

Each of these examples shares a common DNA—real-time data, AI augmentation, and automated execution. Taken together, they represent a tipping point—a convergence of capability and necessity.

Common Misconceptions—Let’s Set the Record Straight
Despite the hype—hyperautomation is not a silver bullet. And it's certainly not about replacing people.

Rather, it’s about redefining roles—freeing human talent from low-value, repetitive tasks and redeploying them toward creative, strategic work.

Yes, there are risks:

Model bias

Technical debt

Change resistance

But with proper change management frameworks—and a Center of Excellence (CoE) to govern deployment—these risks can be mitigated.

Let’s be clear—hyperautomation is a means, not an end. The goal isn’t automation for its own sake. The goal is transformation with intent.

Looking Ahead—Where Do We Go from Here?
The road forward is paved with opportunity—but also ambiguity. As AI capabilities continue to expand—with the advent of multimodal transformers, federated learning, and neural-symbolic hybrids—the landscape will only get more complex.

But complexity isn’t the enemy—entropy is. Without strategic alignment—hyperautomation initiatives will sprawl, fragment, and ultimately stall.

To prevent this, organizations must:

Define clear KPIs linked to business outcomes

Align AI initiatives with core OKRs

Maintain transparency through explainability tooling and audit logs

And above all—organizations must foster a culture of curiosity, resilience, and data-driven decision-making.

Conclusion—From Potential to Performance
Hyperautomation isn’t a trend—it’s a trajectory. It’s the logical next step in a journey that began with macros and ended with models. It’s what happens when intention meets infrastructure—when code meets cognition.

The future isn’t just about smarter machines—it’s about more empowered people. Because at the end of the day—technology is only as transformative as the intent behind it.

So let’s embrace the shift—lean into the synergy—and build a future where intelligence is embedded, outcomes are measurable, and innovation is the default."""

issue_lists = {
    "cliche": CLICHES,
    "jargon": JARGON,
    "ai_tell": AI_TELLS,
    "em_dash": ["—"],
}

suggestion_maps = {
    "cliche": CLICHE_SUGGESTIONS,
    "jargon": JARGON_SUGGESTIONS,
    "ai_tell": AI_TELL_SUGGESTIONS,
}

# 1. Find all potential matches
all_matches = []
for issue_type, patterns in issue_lists.items():
    for pattern in patterns:
        try:
            # Use word boundaries for multi-word phrases, but not for single characters like em-dash
            search_pattern = r'\b' + re.escape(pattern) + r'\b' if len(pattern) > 1 else re.escape(pattern)
            for match in re.finditer(search_pattern, text, flags=re.IGNORECASE):
                all_matches.append({
                    "type": issue_type,
                    "start": match.start(),
                    "end": match.end(),
                    "content": match.group(),
                })
        except re.error:
            print(f"Regex error with pattern: {pattern}")
            continue

# 2. Sort matches by start index, then by length (longest first) to handle overlaps
all_matches.sort(key=lambda x: (x['start'], len(x['content'])), reverse=True)

# 3. Filter out overlapping matches, keeping the longest one
filtered_matches = []
last_end = -1
for match in all_matches:
    if match['start'] >= last_end:
        filtered_matches.append(match)
        last_end = match['end']

# Re-sort by start index to build segments correctly
filtered_matches.sort(key=lambda x: x['start'])

# 4. Build the final segments list
segments = []
last_index = 0
for match in filtered_matches:
    start, end = match['start'], match['end']
    # Add the text segment before the current match
    if start > last_index:
        segments.append({"type": "text", "content": text[last_index:start], "suggestions": []})
    
    # Add the matched segment with its suggestions
    content = match['content']
    issue_type = match['type']
    suggestions = suggestion_maps.get(issue_type, {}).get(content.lower(), [])
    segments.append({"type": issue_type, "content": content, "suggestions": suggestions})
    
    last_index = end

# Add any remaining text after the last match
if last_index < len(text):
    segments.append({"type": "text", "content": text[last_index:], "suggestions": []})

# Print the results for verification
cliche_count = len([s for s in segments if s['type'] == 'cliche'])
jargon_count = len([s for s in segments if s['type'] == 'jargon'])
ai_tell_count = len([s for s in segments if s['type'] == 'ai_tell'])
em_dash_count = len([s for s in segments if s['type'] == 'em_dash'])

print(f"Cliches: {cliche_count}")
print(f"Jargon: {jargon_count}")
print(f"AI Tells: {ai_tell_count}")
print(f"Em-Dashes: {em_dash_count}")
print("\n--- SEGMENTS ---")
print(json.dumps(segments, indent=2))