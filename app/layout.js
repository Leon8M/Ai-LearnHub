import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import SyncClerkUser from "@/components/SyncClerkUser";
import Script from "next/script"; // ✅ Import Script for next/head usage

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI LearnHub",
  description: "App for users to generate courses with AI and learn",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* ✅ Google AdSense script */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
          <Script id="adsbygoogle-init" strategy="afterInteractive">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
