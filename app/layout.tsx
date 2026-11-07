import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/context/Theme";

const inter = localFont({
  src: "./fonts/InterVF.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 700 800 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "300 400 500 700",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://query-hive-v2.vercel.app"),
  title: {
    default: "QueryHive | Programming Q&A Community for Developers",
    template: "%s | QueryHive",
  },
  description:
    "QueryHive is a community-driven Q&A platform where developers ask programming questions, share answers, get AI-powered help and find jobs. Explore web development, mobile apps, algorithms, data structures and more.",
  applicationName: "QueryHive",
  keywords: [
    "QueryHive",
    "programming questions",
    "developer community",
    "Q&A for developers",
    "coding help",
    "Next.js",
    "React",
    "JavaScript",
    "TypeScript",
    "MongoDB",
    "algorithms",
    "data structures",
    "AI answers",
    "developer jobs",
  ],
  openGraph: {
    type: "website",
    siteName: "QueryHive",
    title: "QueryHive | Programming Q&A Community for Developers",
    description:
      "Ask programming questions, share answers, get AI-powered help and find developer jobs.",
  },
  twitter: {
    card: "summary",
    title: "QueryHive | Programming Q&A Community for Developers",
    description:
      "Ask programming questions, share answers, get AI-powered help and find developer jobs.",
  },
  icons: {
    icon: "/assets/logo-light.png",
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <SessionProvider session={session}>
        <body
          className={`${inter.className} ${spaceGrotesk.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
};

export default RootLayout;
