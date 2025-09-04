import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clean Earth Pricing",
  description: "Clean Earth Pricing Entry System",
  generator: "Clean Earth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ overflow: "auto", height: "auto" }}>{children}</body>
    </html>
  );
}
