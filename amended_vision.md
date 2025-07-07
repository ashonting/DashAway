# DashAway – Amended Vision & Overview

## 1. Product Purpose & Value
DashAway is a standalone, web-based Single Page Application (SPA) designed to be a fast, private, and affordable text-cleaning tool. Its core purpose is to empower writers, students, bloggers, and content creators to instantly find and remove em-dashes, clichés, jargon, and common "AI tells" from their writing, resulting in cleaner, more natural-sounding text.

## 2. Target Audience
*   **Bloggers & Marketers:** To improve SEO and authenticity by avoiding AI content penalties.
*   **Students & Academics:** To produce original, undetectable essays and assignments.
*   **Content Creators & Copywriters:** To polish their work and meet editorial standards efficiently.
*   **General Writers:** Anyone who values clear, human, and professional text.

## 3. Core Features & User Experience
*   **Two-Panel Dashboard:** A side-by-side layout where users can paste their text on the left and see the highlighted, cleaned output on the right.
*   **Visual Highlighting:**
    *   Em-dashes in **teal**.
    *   Cliches in **purple**.
    *   Jargon in **yellow**.
    *   AI tells in **pink**.
    *   Complex words in **orange**.
    *   Long sentences in **red**.
*   **Interactive Replacements:** Each highlight is clickable, opening a popover that allows the user to replace the specific instance with a suitable suggestion.
*   **Readability Score:** A Flesch-Kincaid Grade Level score is provided to help users gauge the complexity of their text. The tool also identifies and highlights complex words and long sentences, and provides suggestions for simpler alternatives.
*   **Feedback System:** A modal for users to report bugs or submit suggestions, which are stored in a backend database.
*   **FAQ Panel:** An accessible modal or slide-out panel with answers to common questions.

## 4. UI/UX Structure & Routing
The application is a Single Page Application (SPA) using Next.js for routing.
*   **Header:** Contains the logo and navigation links to the Dashboard, FAQ, and Pricing pages.
*   **Footer:** Contains links to legal pages (Terms, Privacy, Refund Policy) and a button to provide feedback.
*   **Page Routes:**
    *   `/`: The main text-cleaning tool.
    *   `/dashboard`: A placeholder page.
    *   `/pricing`: Plan details and the Paddle checkout integration.
    *   `/faq`: The expandable FAQ page.
    *   `/terms`, `/privacy`, `/refund-policy`, `/cookie-policy`: Static legal pages.
    *   `/admin`: A password-protected dashboard for the owner to view user feedback.

## 5. Backend & Data
*   **Technology:** A FastAPI backend with a SQLite database for the Minimum Viable Product (MVP).
*   **Endpoints:**
    *   `/process`: Handles the core text analysis and highlighting for em-dashes, cliches, jargon, and AI tells.
    *   `/readability`: Calculates the Flesch-Kincaid Grade Level score and identifies complex words and long sentences, providing suggestions for improvement.
    *   `/feedback`: Stores user-submitted feedback.
    *   `/faq`: Serves the FAQ content from the database.
    *   `/auth/paddle`: A webhook to handle subscription events from Paddle.
    *   `/admin/feedback`: An admin-only endpoint to fetch feedback.
*   **Database Schema:** Includes tables for `Feedback` and `FAQ`.

## 6. Design System
*   **CSS:** Tailwind CSS exclusively, with no other frameworks.
*   **Colors:** A defined palette with a primary gradient (teal to purple), an accent yellow, and specific text colors.
*   **Fonts:** Inter and Poppins.
*   **Styling:** `rounded-2xl` for radius and bold, gradient buttons with a `hover:scale` effect.
*   **Accessibility:** All UI must be WCAG 2.1 AA compliant.

## 7. Mission & Differentiators
DashAway solves the problem of "AI tells" and overused phrases that harm content quality and trust. It is designed to be a focused, affordable, and transparent tool, not an over-engineered writing platform. It is a standalone product, independent of any other service.

## 8. Success Criteria
*   High accuracy in em-dash removal and replacement.
*   High detection rate for clichés, jargon, and AI tells.
*   Fast results for standard input.
*   High reliability and uptime.
*   Profitable operation with minimal overhead.
*   Compliance with GDPR, Paddle, and accessibility standards.

## 9. What DashAway is NOT
*   Not a general grammar checker or AI content detector.
*   Not a content generator.
*   Not a full-fledged writing assistant.
*   Not a multi-product suite; it’s focused, simple, and standalone.

## 10. Summary
DashAway is your fast, reliable, and affordable text cleaner for the AI age—removing and replacing em-dashes, clichés, jargon, and “AI tells” at the click of a button, while ensuring the highest privacy and compliance standards. It is built as a modern SPA with React, Tailwind, and FastAPI, delivered directly to live production, and always owned and operated independently by Adam Shonting.
