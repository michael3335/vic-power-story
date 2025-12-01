import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Jost } from "next/font/google";
import { CustomCursor } from "./components/CustomCursor";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" className={`${jost.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-white text-black">
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
