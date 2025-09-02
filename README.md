# 🌟 Kamusi AI: The AI-Powered Learning Platform

Kamusi AI is a fully-featured, AI-powered learning platform that revolutionizes how educational content is created and consumed.  
Using the power of Google's **Gemini API**, users can generate comprehensive, personalized courses on any topic imaginable, complete with detailed chapters and relevant video resources from **YouTube**.  
It also features a **public blog** with insights into AI and technology.

---

## 📜 Table of Contents
- [🚀 Live Demo](#-live-demo)
- [📝 Project Overview](#-project-overview)
- [🔧 Features Overview](#-features-overview)
- [🧠 User Flow](#-user-flow)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [🔑 Environment Variables](#-environment-variables)
- [📄 License](#-license)
- [📬 Contact](#-contact)

---

## 🚀 Live Demo
👉 [Click here to view the live demo](https://kamusi.denexsoftware.co.ke/)

---

## 📝 Project Overview
This is a fully-featured **AI-powered learning platform** built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Shadcn UI**, **Clerk** for authentication, and integrated with **Gemini API** and **YouTube API**.  

The platform allows users to generate and consume educational content on any topic they desire through an interactive, course-based experience.  
It also features a **public blog** for articles and insights on AI and learning.

---

## 🔧 Features Overview
- 🤖 **AI-Powered Course Generation** – Users create structured courses by entering a topic. The Gemini API generates a full outline with chapters.  
- 📚 **Detailed Content Generation** – Each topic is expanded into rich, detailed text for deep learning.  
- 🎬 **Integrated Video Learning** – Fetches high-quality videos via the YouTube API and embeds them into courses.  
- 🎓 **Enrollment & Progress Tracking** – Users can enroll in courses, mark chapters as complete, and track progress.  
- 📱 **Public Blog for AI Insights** – Open access to AI and tech-related articles.  
- 🖥️ **Responsive & Accessible UI** – Optimized for desktop, tablet, and mobile devices.  

---

## 🧠 User Flow
1. **Create a Course** – User enters a learning topic.  
2. **Generate Structure** – Gemini API returns a course outline with chapters.  
3. **Generate Chapters** – AI expands each chapter with detailed explanations.  
4. **View Course** – Users read AI-generated content and watch embedded YouTube videos.  
5. **Track Progress** – Mark chapters as complete and track learning journey.  
6. **Access Blog** – Anyone can read AI & technology insights without login.  

---

## 💻 Tech Stack
- **Framework**: Next.js 14 (App Router)  
- **Styling**: Tailwind CSS & Shadcn UI  
- **Authentication**: Clerk  
- **AI Integration**: Google Gemini API  
- **Video Integration**: YouTube Data API v3  
- **Database**: PostgreSQL  
- **Deployment**: Vercel  

---

## 🚀 Getting Started
Follow these steps to set up and run the project locally:

### Prerequisites
- Node.js (18.x or later)  
- npm, yarn, or pnpm package manager  

### Installation
Clone the repository:

```bash
git clone https://github.com/Leon8M/Ai-LearnHub
cd Kamusi
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
1. Set up environment variables:  
   - Create a `.env.local` file in the root directory.  
   - Copy the contents of `.env.example` or use the list below.  

2. Start the development server:

```bash
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.  

---

## 🔑 Environment Variables
Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## 📄 License
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE.md) file for details.

---

## 📬 Contact
👤 **Leon Munene**  
📧 Email: [leonmunene254@gmail.com](mailto:leonmunene254@gmail.com)  
🔗 Project Link: [https://github.com/Leon8M/Ai-LearnHub](https://github.com/Leon8M/Ai-LearnHub)
