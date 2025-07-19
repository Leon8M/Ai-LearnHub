import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "./provider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import SyncClerkUser from "@/components/SyncClerkUser";



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
    icon: '/logo.svg', 
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
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
