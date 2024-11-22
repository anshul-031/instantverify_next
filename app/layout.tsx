import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { FeedbackBanner } from "@/components/feedback-banner";
import { LanguageSelector } from "@/components/language-selector";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InstantVerify.in - Real-time Background Verification",
  description:
    "Instant background verification services for India including Aadhaar verification, criminal record checks, and police verification reports.",
  keywords: [
    "background verification",
    "Aadhaar verification",
    "police verification",
    "India",
  ],
  authors: [{ name: "InstantVerify.in" }],
  creator: "InstantVerify.in",
  publisher: "InstantVerify.in",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://instantverify.in",
    title: "InstantVerify.in - Real-time Background Verification",
    description:
      "Instant background verification services for India including Aadhaar verification, criminal record checks, and police verification reports.",
    siteName: "InstantVerify.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantVerify.in - Real-time Background Verification",
    description:
      "Instant background verification services for India including Aadhaar verification, criminal record checks, and police verification reports.",
    creator: "@instantverify",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FeedbackBanner />
            <div className="fixed bottom-4 left-4">
              <LanguageSelector />
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}