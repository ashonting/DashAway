#!/usr/bin/env python3
"""
Populate the FAQ database with common questions and answers.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models.faq import FAQ
from app.database import Base

# Load environment variables
load_dotenv('.env')

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL environment variable is not set")
    sys.exit(1)

# Create database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FAQ data
faqs_data = [
    {
        "question": "How does DashAway work?",
        "answer": "DashAway analyzes your text and identifies problematic phrases like em-dashes, clichés, jargon, and AI 'tells' that make writing sound robotic. Simply paste your text, click 'Clean Text Now,' and we'll highlight issues with suggestions for improvement."
    },
    {
        "question": "Is my text stored or used to train AI models?",
        "answer": "No, absolutely not. Your text is processed entirely in real-time and never stored on our servers. We don't use your content to train any AI models. Your writing remains completely private and secure."
    },
    {
        "question": "What's the difference between Basic and Pro accounts?",
        "answer": "Basic accounts get 2 free text cleanings per month with all core features. Pro accounts ($4/month) get unlimited cleanings, document history, advanced analytics, and priority support. Anonymous users get 1 free try without signup."
    },
    {
        "question": "Can DashAway detect AI-generated content?",
        "answer": "DashAway identifies common 'AI tells' - phrases that frequently appear in AI-generated text like 'delve into,' 'furthermore,' and 'in conclusion.' While not a definitive AI detector, it helps make AI-assisted writing sound more human and natural."
    },
    {
        "question": "What types of writing issues does DashAway find?",
        "answer": "DashAway identifies: Em-dashes that interrupt flow, overused clichés like 'game-changer,' corporate jargon like 'utilize' instead of 'use,' common AI phrases, and calculates readability scores. Complex word simplification and long sentence restructuring are coming soon."
    },
    {
        "question": "How accurate are the suggestions?",
        "answer": "Our suggestions are based on clear writing principles and extensive phrase databases. While not every suggestion will fit your style, they're designed to make writing more direct, readable, and engaging. You can accept or reject any suggestion."
    },
    {
        "question": "Can I cancel my Pro subscription anytime?",
        "answer": "Yes, you can cancel your Pro subscription at any time with no fees or penalties. Your subscription will remain active until the end of your current billing period, then automatically switch to Basic (2 uses/month)."
    },
    {
        "question": "Does DashAway work with different writing styles?",
        "answer": "Yes, DashAway focuses on objective issues like overused phrases and unclear jargon rather than subjective style choices. It works well for business writing, academic papers, blog posts, marketing copy, and creative writing."
    },
    {
        "question": "What's the character limit for text analysis?",
        "answer": "You can analyze up to 10,000 characters per submission. For longer documents, we recommend breaking them into sections or upgrading to Pro for more efficient workflow with document history."
    },
    {
        "question": "How do I get support or report bugs?",
        "answer": "Use the 'Feedback' button in the footer to report bugs or request features. For account issues, email support@dashaway.io. Pro users get priority support with faster response times."
    }
]

def populate_faqs():
    """Populate the FAQ table with initial data."""
    db = SessionLocal()
    try:
        # Check if FAQs already exist
        existing_count = db.query(FAQ).count()
        if existing_count > 0:
            print(f"FAQs already exist ({existing_count} items). Skipping population.")
            return

        # Add each FAQ
        for faq_data in faqs_data:
            faq = FAQ(
                question=faq_data["question"],
                answer=faq_data["answer"]
            )
            db.add(faq)
        
        db.commit()
        print(f"Successfully added {len(faqs_data)} FAQs to the database.")
        
    except Exception as e:
        db.rollback()
        print(f"Error populating FAQs: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_faqs()