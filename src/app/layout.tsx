import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { clerkPublishableKey, isClerkClientConfigured } from "@/lib/clerk-config";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
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
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {content}
    </ClerkProvider>
  );
}
