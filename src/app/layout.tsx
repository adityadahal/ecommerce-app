import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumbini Meat & Grocery — Fresh Meat & Groceries Delivered",
  description: "Shop fresh meat, groceries, and essentials online with home delivery across Melbourne. Quality fruits, vegetables, dairy, meat, and pantry staples.",
  keywords: ["groceries", "meat", "online shopping", "fresh food", "delivery", "Melbourne", "Australia", "Lumbini"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
