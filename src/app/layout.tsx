import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshMart - Fresh Groceries Delivered",
  description: "Shop fresh groceries online with home delivery across Melbourne. Quality fruits, vegetables, dairy, meat, and pantry essentials.",
  keywords: ["groceries", "online shopping", "fresh food", "delivery", "Melbourne", "Australia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
