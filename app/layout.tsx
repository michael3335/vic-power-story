import "./globals.css";
import type { Metadata } from "next";

const faviconBase = "https://www.michaelharrison.au";

export const metadata: Metadata = {
  title: "Victoria Power & Gas Story",
  description:
    "How Victoria's wholesale electricity prices moved from gas-driven to weather and renewables-driven, using 2015–2025 data.",
  icons: {
    icon: [
      { url: `${faviconBase}/favicon.svg`, type: "image/svg+xml" },
      { url: `${faviconBase}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${faviconBase}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: `${faviconBase}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: `${faviconBase}/favicon.svg`, color: "#000000" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-white text-black">
        {children}
      </body>
    </html>
  );
}
