import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "react-hot-toast";
import AppLayout from "@/components/layouts/AppLayout";

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppLayout>
              <Toaster position="top-right" />
              {children}
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
