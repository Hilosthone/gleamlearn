# GleamLearn AI 🚀

> Transform any document, textbook, or lecture note into an interactive, gamified learning experience powered by advanced AI.

---

## 🌟 Overview

**GleamLearn** is an AI-native educational platform designed to bridge the gap between static study materials and active learning. By leveraging a high-performance **FastAPI microservice** for document analysis and a fluid **Next.js** web interface, GleamLearn instantly converts dense PDFs, notes, and textbook chapters into structured lessons, smart quizzes, flashcards, and interactive AI tutoring sessions.

---

## ✨ Key Features

* **📄 Upload-to-Learn Pipeline:** Drag and drop PDFs, lecture slides, or text files. Our backend automatically parses, chunks, and structures the content for personalized curriculum generation.
* **🤖 Smart AI Tutor & Classroom:** Context-aware AI tutoring that answers student inquiries directly referencing the uploaded source materials, complete with step-by-step explanations.
* **🔥 Gamified Streaks & XP:** Keep learners motivated with daily streaks, experience points (XP), and leaderboards that turn studying into a habit.
* **🌓 Seamless Theme Switching:** Fully responsive design supporting both clean light and immersive dark modes out of the box.
* **📱 Modern Glassmorphism UI:** Built with Framer Motion animations and Tailwind CSS for a smooth, high-end user experience.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
* **Backend:** Python, FastAPI, Render (Cloud Deployment)
* **Database & Storage:** PostgreSQL / MongoDB / Supabase integrations

---

## 🚀 Getting Started Locally

Follow these instructions to set up the project locally on your machine.

### Prerequisites

* Node.js (v18+ recommended)
* Python (v3.10+)
* npm, yarn, or pnpm

### 1. Clone the Repository

```bash
git clone https://github.com/Hilosthone/gleamlearn
cd gleamlearn

```

### 2. Frontend Setup (Next.js)

```bash
# Navigate to the frontend directory (if separated) or root
npm install

# Run the development server
npm run dev

```

The application will be available at `http://localhost:3000`.

### 3. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload

```

Interactive API documentation will be available at `http://localhost:8000/docs`.

---

## 👨‍💻 Founder & Leadership

* **Hilosthone Sulyman** – *Founder & CEO*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.