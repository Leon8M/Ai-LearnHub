import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import SyncClerkUser from "@/components/SyncClerkUser";
import Script from "next/script";


// ✅ NEW FONTS
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

// ✅ Custom logo font from Google: Unbounded
const unbounded = localFont({
  src: [
    {
      path: "../public/fonts/Unbounded-Bold.ttf", // make sure this file exists
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata = {
  title: "Kamusi AI",
  description: "App for users to generate courses with AI and learn",
  icons: {
    icon: "/logo-main.png",
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
