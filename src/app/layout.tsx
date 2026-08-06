import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();
const personName = "Ivan Kolesnikov";
const pageTitle = "Ivan Kolesnikov | Experience Designer Portfolio";
const pageDescription = "Official portfolio of Ivan Kolesnikov, Experience Designer focused on generative AI, communication, multimedia storytelling, and strategy.";
const ogImage = `${siteUrl}/logos/apple-touch-icon.png`;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: personName,
  url: siteUrl,
  image: ogImage,
  jobTitle: "Experience Designer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Hannover",
  },
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: personName,
  url: siteUrl,
  inLanguage: ["en", "de"],
};

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
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  applicationName: personName,
  keywords: [
    "Ivan Kolesnikov",
    "Ivan Kolesnikov portfolio",
    "Experience Designer",
    "Generative AI",
    "Integrated Media and Communication",
    "Creative communication",
    "Portfolio Germany",
  ],
  authors: [{ name: personName, url: siteUrl }],
  creator: personName,
  publisher: personName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: siteUrl,
    siteName: personName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 180,
        height: 180,
        alt: `${personName} portfolio icon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${borna.variable} antialiased`}>
      <head>
        <link rel="icon" href="/logos/favicon.ico" sizes="any" />
        <link rel="icon" href="/logos/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/logos/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/logos/apple-touch-icon.png" />
      </head>
      <body className={borna.className} style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}