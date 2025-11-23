import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";
import AppLayout from "@/components/layouts/AppLayout";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Script from "next/script";
import AnalyticsTracker from "@/hooks/Analytics";
import ErrorBoundary from "@/components/error/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gigs Mint – Professional Freelancer Marketplace",
    template: "%s | Gigs Mint",
  },
  description:
    "Gigs Mint is a professional freelancer marketplace with LinkedIn-inspired design. Browse gigs, submit bids, and grow your freelance career with confidence.",
  keywords: [
    "freelance",
    "marketplace",
    "gigs",
    "jobs",
    "bids",
    "hire",
    "post a job",
    "Gigs Mint",
  ],
  authors: [{ name: "Gigs Mint" }],
  creator: "Gigs Mint",
  publisher: "Gigs Mint",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://gigsmint.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gigsmint.com",
    title: "Gigs Mint – Futuristic Freelancer Marketplace",
    description:
      "Browse jobs and hire talent on Gigs Mint. A modern, professional marketplace with bid-based workflows and LinkedIn-blue styling.",
    siteName: "Gigs Mint",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gigs Mint – Futuristic Freelancer Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gigs Mint – Futuristic Freelancer Marketplace",
    description:
      "Gigs Mint is the professional way to browse jobs, post a job, and bid confidently.",
    images: ["/og-image.jpg"],
    creator: "@gigsmint",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gigs Mint",
    "url": "https://gigsmint.com",
    "logo": "https://gigsmint.com/logo.png",
    "description": "Gigs Mint is a futuristic freelancer marketplace. Browse jobs, post a job, and bid with confidence.",
    "sameAs": [
      "https://www.facebook.com/gigsmint",
      "https://www.twitter.com/gigsmint",
      "https://www.linkedin.com/company/gigsmint"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0966C2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gigs Mint" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                      Initializing experience…
                    </div>
                  }
                >
                  <AppLayout>
                    <Toaster position="top-right" />
                    <ServiceWorkerRegistration />
                    {children}
                  </AppLayout>
                </Suspense>
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
