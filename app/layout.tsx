import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mode Atlas — Interactive Musical Modes",
  description: "Explore and hear 84 musical modes across all 12 major keys.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
