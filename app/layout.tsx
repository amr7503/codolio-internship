import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codolio-internship.vercel.app"),
  title: "CodolioSheet - DSA Question Tracker",
  description:
    "Track your DSA interview preparation progress with the Striver A2Z sheet. A modern, feature-rich web application for managing Data Structures and Algorithms questions.",
  keywords: ["DSA", "interview preparation", "coding", "algorithms", "data structures", "question tracker"],
  authors: [{ name: "CodolioSheet Team" }],
  creator: "CodolioSheet",
  publisher: "CodolioSheet",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codolio-internship.vercel.app",
    title: "CodolioSheet - DSA Question Tracker",
    description: "Track your DSA interview preparation progress with ease",
    siteName: "CodolioSheet",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CodolioSheet Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodolioSheet - DSA Question Tracker",
    description: "Track your DSA interview preparation progress with ease",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
