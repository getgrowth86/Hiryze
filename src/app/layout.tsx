import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiryze – Meet yourself in Safety",
  description: "Kostenloses Webinar mit Lena – 09.12.2026, 19 Uhr",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Adobe Fonts (Typekit) – replace kit ID when available */}
        <link rel="stylesheet" href="https://use.typekit.net/YOURKITID.css" />
        {/* Fallback: Cormorant Garamond + Pontano Sans from Google */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Pontano+Sans:wght@300;400;500&display=swap"
        />
      </head>
      <body className="bg-white font-body text-forest antialiased">{children}</body>
    </html>
  );
}
