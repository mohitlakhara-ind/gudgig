import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JobPortal - Find Your Dream Job",
    template: "%s | JobPortal"
  },
  description: "Discover thousands of job opportunities on JobPortal. Connect with top employers, apply to jobs, and advance your career with our comprehensive job search platform.",
  keywords: ["jobs", "careers", "employment", "job search", "hiring", "recruitment", "job portal"],
  authors: [{ name: "JobPortal Team" }],
  creator: "JobPortal",
  publisher: "JobPortal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://jobportal.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jobportal.com",
    title: "JobPortal - Find Your Dream Job",
    description: "Discover thousands of job opportunities on JobPortal. Connect with top employers, apply to jobs, and advance your career.",
    siteName: "JobPortal",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JobPortal - Find Your Dream Job",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobPortal - Find Your Dream Job",
    description: "Discover thousands of job opportunities on JobPortal. Connect with top employers, apply to jobs, and advance your career.",
    images: ["/og-image.jpg"],
    creator: "@jobportal",
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
    "name": "JobPortal",
    "url": "https://jobportal.com",
    "logo": "https://jobportal.com/logo.png",
    "description": "Discover thousands of job opportunities on JobPortal. Connect with top employers, apply to jobs, and advance your career with our comprehensive job search platform.",
    "sameAs": [
      "https://www.facebook.com/jobportal",
      "https://www.twitter.com/jobportal",
      "https://www.linkedin.com/company/jobportal"
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
