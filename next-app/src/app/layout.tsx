import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProductSyncProvider } from "@/context/ProductSyncContext";
import { CartProvider } from "@/context/CartContext";
import { LikeProvider } from "@/context/LikeContext";
import { LoaderProvider } from "@/context/LoaderContext";

import GlobalLoader from "@/components/(sheared)/GlobarLoader";
import { Inter } from "next/font/google";

/**
 * Viewport configuration
 *
 * maximumScale is intentionally omitted so users can
 * zoom on mobile devices for better accessibility.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Inter font
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Global Metadata
 *
 * This metadata acts as the default metadata for the website.
 *
 * IMPORTANT:
 * Do not define a global canonical URL here.
 * Individual pages should define their own canonical URL
 * using generateMetadata() or page-level metadata.
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://zelton.in"
  ),

  title: {
    default: "SVastra — Wear Yourself",
    template: "%s | SVastra",
  },

  description:
    "SVastra — Wear Yourself. Architectural Indian handlooms for one woman, many roles, many moods. Unapologetic. Grounded. Sovereign.",

  keywords: [
    "SVastra",
    "Wear Yourself",
    "handloom",
    "Indian fashion",
    "tussar silk",
    "architectural textiles",
    "lifestyle",
    "e-commerce India",
  ],

  /**
   * Robots
   *
   * Allows search engines to index and follow
   * publicly accessible pages.
   *
   * Private pages such as login, checkout, account,
   * admin, etc. should override this with noindex.
   */
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

  /**
   * Open Graph metadata
   *
   * Default metadata for social sharing.
   * Individual product/category pages should override
   * these values with their own dynamic metadata.
   */
  openGraph: {
    title: "SVastra — Wear Yourself",

    description:
      "Architectural Indian handlooms for one woman, many roles, many moods.",

    siteName: "SVastra",

    url: process.env.NEXT_PUBLIC_APP_URL || "https://zelton.in",

    locale: "en_US",

    type: "website",

    images: [
      {
        url: "/about-showcase.png",
        width: 1200,
        height: 630,
        alt: "SVastra — Wear Yourself",
      },
    ],
  },

  /**
   * Twitter / X Card metadata
   */
  twitter: {
    card: "summary_large_image",

    title: "SVastra — Wear Yourself",

    description:
      "Architectural Indian handlooms for one woman, many roles, many moods.",

    images: ["/about-showcase.png"],
  },

  /**
   * Favicon — SVastra logo mark
   */
  icons: {
    icon: [{ url: "/svastra/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/svastra/logo-mark.png", type: "image/png" }],
    shortcut: "/svastra/logo-mark.png",
  },
};

/**
 * Root Layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body overflow-x-hidden">
        <LoaderProvider>
          <GlobalLoader />

          <AuthProvider>
            <ProductSyncProvider>
              <NotificationProvider>
                <LikeProvider>
                  <CartProvider>{children}</CartProvider>
                </LikeProvider>
              </NotificationProvider>
            </ProductSyncProvider>
          </AuthProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
