# DashAway

A modern, web-based tool for instantly cleaning and refining your writing by removing em-dashes, clichés, jargon, and common AI "tells."

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-lightgrey)

## ✨ Project Vision & Overview

### 1. Product Purpose & Value
DashAway is a standalone, web-based Single Page Application (SPA) designed to be a fast, private, and affordable text-cleaning tool. Its core purpose is to empower writers, students, bloggers, and content creators to instantly find and remove em-dashes, clichés, jargon, and common "AI tells" from their writing, resulting in cleaner, more natural-sounding text.

### 2. Target Audience
*   **Bloggers & Marketers:** To improve SEO and authenticity by avoiding AI content penalties.
*   **Students & Academics:** To produce original, undetectable essays and assignments.
*   **Content Creators & Copywriters:** To polish their work and meet editorial standards efficiently.
*   **General Writers:** Anyone who values clear, human, and professional text.

### 3. Core Features & User Experience
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

### 4. UI/UX Structure & Routing
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

### 5. Backend & Data
*   **Technology:** A FastAPI backend with a SQLite database for the Minimum Viable Product (MVP).
*   **Endpoints:**
    *   `/process`: Handles the core text analysis and highlighting for em-dashes, cliches, jargon, and AI tells.
    *   `/readability`: Calculates the Flesch-Kincaid Grade Level score and identifies complex words and long sentences, providing suggestions for improvement.
    *   `/feedback`: Stores user-submitted feedback.
    *   `/faq`: Serves the FAQ content from the database.
    *   `/auth/paddle`: A webhook to handle subscription events from Paddle.
    *   `/admin/feedback`: An admin-only endpoint to fetch feedback.
*   **Database Schema:** Includes tables for `Users`, `Feedback`, `Usage`, and `Subscriptions`.
*   **Compliance:** GDPR compliance is handled via a `support@dashaway.io` email for data requests, with no non-essential cookies.

### 6. Design System
*   **CSS:** Tailwind CSS exclusively, with no other frameworks.
*   **Colors:** A defined palette with a primary gradient (teal to purple), an accent yellow, and specific text colors.
*   **Fonts:** Inter and Poppins.
*   **Styling:** `rounded-2xl` for radius and bold, gradient buttons with a `hover:scale` effect.
*   **Accessibility:** All UI must be WCAG 2.1 AA compliant.

### 7. Mission & Differentiators
DashAway solves the problem of "AI tells" and overused phrases that harm content quality and trust. It is designed to be a focused, affordable, and transparent tool, not an over-engineered writing platform. It is a standalone product, independent of any other service.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI:** React

### Backend
*   **Framework:** FastAPI
*   **Language:** Python
*   **Database:** SQLite (with SQLAlchemy)
*   **NLP:** NLTK, textstat

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or later)
*   npm
*   Python 3.10 or later

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url/dashaway.git
    cd dashaway
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python3 download_nltk_data.py
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Development Servers

1.  **Start the Backend Server:**
    *   Navigate to the `backend` directory.
    *   Run the following command:
    ```bash
    uvicorn main:app --reload
    ```
    *   The backend will be available at `http://localhost:8000`.

2.  **Start the Frontend Server:**
    *   In a new terminal, navigate to the `frontend` directory.
    *   Run the following command:
    ```bash
    npm run dev
    ```
    *   The frontend will be available at `http://localhost:3000`.

## Usage

Once both servers are running, open your web browser and navigate to `http://localhost:3000`. You can then paste your text into the input panel, click "Clean Text," and see the results in the output panel.

## 📂 Project Structure

```
dashaway/
├── backend/
│   ├── venv/
│   ├── ai_tells.py
│   ├── ai_tell_suggestions.py
│   ├── cliches.py
│   ├── cliche_suggestions.py
│   ├── jargon.py
│   ├── jargon_suggestions.py
│   ├── em_dash_suggestions.py
│   ├── database.py
│   ├── download_nltk_data.py
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   └── app/
    │       ├── (pages)/
    │       ├── layout.tsx
    │       └── page.tsx
    ├── public/
    ├── next.config.ts
    └── tailwind.config.ts
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a pull request.

## License

This project is licensed under the AGPLv3 License - see the [LICENSE](LICENSE) file for details.


## 📬 Contact

For any questions or feedback, please reach out to `support@dashaway.io`.
