import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const borna = localFont({
  src: [
    {
      path: "../../public/fonts/Borna-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Borna-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Borna-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Borna-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Borna-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Borna-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Borna-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Borna-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-borna",
});

export const metadata: Metadata = {
  title: "IVAN KOLESNIKOV | PORTFOLIO",
  description: "Creative portfolio by Ivan Kolesnikov.",
  keywords: ["portfolio", "creative", "design", "communication", "Ivan Kolesnikov"],
  authors: [{ name: "Ivan Kolesnikov" }],
  openGraph: {
    title: "IVAN KOLESNIKOV | PORTFOLIO",
    description: "Creative portfolio by Ivan Kolesnikov.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IVAN KOLESNIKOV | PORTFOLIO",
    description: "Creative portfolio by Ivan Kolesnikov.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${borna.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={borna.className} style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}