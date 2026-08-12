import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { clerkPublishableKey, isClerkClientConfigured } from "@/lib/clerk-config";
// Order matters: the design system defines the tokens and base layer, then
// globals.css layers anything app-specific on top of them.
import "@vivancedata/ui/styles";
import "./globals.css";

/**
 * The design system's font stack starts with `var(--font-geist-sans)`, and the
 * preset expects each app to load the face itself via next/font. This app never
 * did -- `font-sans` resolved to an undefined variable and fell through to the
 * system UI face, so the CRM was set in a different typeface from the marketing
 * site and the learning platform while nominally sharing their design system.
 */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vivancedata CRM",
    template: "%s | Vivancedata CRM",
  },
  description: "Client relationship management for AI consulting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );

  if (!isClerkClientConfigured()) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/sign-in">
      {content}
    </ClerkProvider>
  );
}
