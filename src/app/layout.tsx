import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Season Match",
  description: "Discover your 12-season color palette in 3 questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
