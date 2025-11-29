import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Victoria Power & Gas Story",
  description:
    "How Victoria's wholesale electricity prices moved from gas-driven to weather and renewables-driven, using 2015–2025 data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}