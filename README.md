# 🤖 AI LearnHub: The AI-Powered Learning Platform

AI LearnHub is a fully-featured, AI-powered learning platform built to revolutionize how educational content is created and consumed. Using the power of Google's Gemini API, users can generate comprehensive courses on any topic imaginable, complete with detailed chapters and relevant video resources from YouTube.

---

## 📜 Table of Contents

* [🚀 Live Demo](#-live-demo)
* [📝 Project Overview](#-project-overview)
* [🔧 Features Overview](#-features-overview)
* [🧠 User Flow](#-user-flow)
* [💻 Tech Stack](#-tech-stack)
* [🚀 Getting Started](#-getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Running the Application](#running-the-application)
* [🔑 Environment Variables](#-environment-variables)
* [📄 License](#-license)
* [📬 Contact](#-contact)

---

## 🚀 Live Demo

[Live Demo Link](https://learn-with-ai-lilac.vercel.app/)


## 📝 Project Overview

This is a fully-featured AI-powered learning platform built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Shadcn UI**, **Clerk** for auth, and integrated with **Gemini API** and **YouTube API**. The platform allows users to generate and consume educational content on any topic they desire through an interactive, course-based experience.

---

## 🔧 Features Overview

* 🤖 **Course Generation Using AI**: Users can create courses simply by entering a topic or subject idea. This input is sent to the Gemini API, which returns a structured draft including a course outline, chapter names, and high-level direction.

* 📚 **Chapter & Content Generation**: Each chapter's topics are individually expanded using Gemini to generate full, rich learning content with detailed explanations. This enables a deep dive into any learning area.

* 🎬 **YouTube Integration for Video Learning**: After content generation, chapter topics are sent to the YouTube Data API to fetch relevant, high-quality educational videos, which are then embedded directly into the course page for a multi-modal learning experience.

* 🎓 **Enrollment & Progress Tracking**: Users can enroll in any generated course. The system allows them to mark chapters as completed or incomplete, providing a clear and simple way to track their learning progress.

* 📱 **Responsive & Accessible UI**: Built with Tailwind CSS and Shadcn UI, the platform is fully responsive across all screen sizes. Special attention has been given to mobile-friendly sidebars and learning pages to ensure a seamless experience on any device.

---

## 🧠 User Flow

1. **Create a Course**: The user enters a topic they want to learn about.
2. **Generate Structure**: The app sends the topic to Gemini, which returns a complete course structure with chapter titles.
3. **Generate Chapters**: The user can then trigger the generation of content for each chapter. Gemini expands the chapter topics into rich, detailed text.
4. **View Course**: The user navigates the course, reading the AI-generated content and watching the embedded YouTube videos that have been automatically fetched.
5. **Mark Progress**: As the user completes chapters, they can mark them as "done", and their progress is visually tracked.
6. **Manage via Workspace**: A central dashboard allows users to view, edit, or continue any of the courses they have created or enrolled in.

---

## 💻 Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS & Shadcn UI
* **Authentication**: Clerk
* **State Management**: React Context API, useState, SWR for data fetching
* **AI Integration**: Google Gemini API
* **Video Integration**: YouTube Data API v3
* **Database**: PostgreSQL
* **Deployment**: Vercel

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have **Node.js (version 18.x or later)** and **npm/yarn/pnpm** installed on your machine.

### Installation

Clone the repository:

```bash
git clone https://github.com/Leon8M/LearnWithAi.git
cd LearnWithAi
```

Install dependencies:

```bash
npm install
# OR
yarn install
# OR
pnpm install
```

### Running the Application

Set up your environment variables:

1. Create a `.env.local` file in the root of your project.
2. Copy the contents of `.env.example` or use the list below and fill in the required API keys and secrets.

Run the development server:

```bash
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔑 Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## 📄 License

This project is licensed under the **MIT License** - see the `LICENSE.md` file for details.

---

## 📬 Contact

**Leon Munene** — [leonmunene254@gmail.com](mailto:leonmunene254@gmail.com)
**Project Link**: [https://github.com/Leon8M/LearnWithAi](https://github.com/Leon8M/LearnWithAi)
