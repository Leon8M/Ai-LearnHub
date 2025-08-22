import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import SyncClerkUser from "@/components/SyncClerkUser";
import Script from "next/script";


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
  title: "Kamusi AI | AI Course Generator & Personalized Learning Platform",
  description: "Generate structured, personalized courses on any topic instantly with Kamusi AI. Your journey to mastery in programming, data science, and more begins now.",
  
  openGraph: {
    title: "Kamusi AI | AI-Powered Course Creator",
    description: "Instantly create and learn personalized courses on any topic with AI.",
    url: "https://kamusi.denexsoftware.co.ke/", 
    siteName: "Kamusi AI",
    images: [
      {
        url: 'https://kamusi.denexsoftware.co.ke/og-image.png',
        width: 2560,
        height: 1440,
        alt: 'Kamusi AI - AI Course Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  alternates: {
    canonical: 'https://kamusi.denexsoftware.co.ke/', 
  },

  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2511222876461022"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <Script id="adsbygoogle-init" strategy="afterInteractive">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
          <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2511222876461022"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />
        </head>
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
