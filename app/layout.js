import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import SyncClerkUser from "@/components/SyncClerkUser";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";


import { Inter, Sora } from "next/font/google";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-brand",
});


const unbounded = localFont({
  src: [
    {
      path: "../public/fonts/Unbounded-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kamusi AI | AI Course Generator & Personalized Learning Platform",
  description:
    "Generate structured courses with lessons, quizzes and videos on any topic, in English or Kiswahili. Kamusi AI turns curiosity into a learning plan in minutes.",
  openGraph: {
    title: "Kamusi AI | AI-Powered Course Creator",
    description: "Create and learn personalized courses with lessons and quizzes on any topic.",
    url: "/",
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE, alt: "Kamusi AI - AI Course Generator" }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`
            ${geistSans.variable} 
            ${geistMono.variable} 
            ${inter.variable} 
            ${sora.variable} 
            ${unbounded.variable} 
            font-sans antialiased
          `}
        >
          <Provider>
            <SyncClerkUser />
            {children}
          </Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
