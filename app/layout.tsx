import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/trpc-client";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://robloxdiscover.com'),
  title: {
    default: "RobloxDiscover - Quality Game Discovery",
    template: "%s | RobloxDiscover"
  },
  description: "Discover high-quality Roblox games with intelligent filtering and genre-based search. Find hidden gems rated 80% and above with real-time player counts.",
  keywords: ["Roblox", "games", "discovery", "quality games", "Roblox search", "game finder"],
  authors: [{ name: "RobloxDiscover" }],
  creator: "RobloxDiscover",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://robloxdiscover.com",
    siteName: "RobloxDiscover",
    title: "RobloxDiscover - Quality Game Discovery",
    description: "Discover high-quality Roblox games with intelligent filtering and genre-based search.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RobloxDiscover"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RobloxDiscover - Quality Game Discovery",
    description: "Discover high-quality Roblox games with intelligent filtering and genre-based search.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ErrorBoundary>
            <TRPCProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster />
            </TRPCProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
