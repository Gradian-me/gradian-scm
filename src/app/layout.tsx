import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gradian Supply Chain Management",
  description: "Comprehensive supply chain management system for pharmaceutical companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/odometer-theme-minimal.css" />
        <link rel="stylesheet" href="/fonts/estedad/estedad.css" />
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
